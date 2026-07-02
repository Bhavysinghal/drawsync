import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import nodemailer from "nodemailer";
import { middleware } from "./auth.middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { asyncHandler } from "./utils/asyncHandler";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const FRONTEND_URL = process.env.FRONTEND_URL || "https://draw-app-frontend-nine.vercel.app/";

// Lightweight health check — used by the frontend to detect if the
// Render free-tier instance is asleep before submitting real requests.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// --- 3-random-words slug generator ---
const ADJECTIVES = [
  "swift", "bright", "calm", "dark", "early", "fierce", "gentle", "happy",
  "icy", "jolly", "keen", "lively", "misty", "noble", "odd", "proud",
  "quiet", "rapid", "silent", "tall", "urban", "vivid", "warm", "wild",
  "young", "zesty", "amber", "bold", "crisp", "deep", "empty", "flat",
  "grand", "heavy", "inner", "jade", "kind", "light", "muted", "neat",
  "open", "plain", "quick", "rough", "sharp", "thin", "ultra", "vast",
  "wavy", "exact",
];

const NOUNS = [
  "river", "cloud", "stone", "flame", "frost", "blade", "cedar", "delta",
  "eagle", "field", "grove", "haven", "inlet", "jewel", "knoll", "lunar",
  "maple", "north", "ocean", "piano", "quest", "ridge", "sigma", "titan",
  "umbra", "vapor", "whale", "xenon", "yacht", "zephyr", "atlas", "brush",
  "coral", "dunes", "epoch", "forge", "globe", "heron", "ivory", "jungle",
  "karma", "latch", "mango", "nexus", "orbit", "pixel", "quark", "raven",
  "spark", "trail",
];

function generateSlug(): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${pick(NOUNS)}`;
}
// -------------------------------------

function roomAccessFilter(userId: string) {
  return {
    OR: [
      { visibility: "PUBLIC" as const },
      { adminId: userId },
      { collaborators: { some: { id: userId } } },
    ],
  };
}

app.get("/auth/google", (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});

app.get("/auth/google/callback", asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.status(400).send("No code provided");
    return;
  }

  const { data } = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  const { access_token } = data;

  const { data: googleUser } = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  const { email, name, picture, id: googleId } = googleUser;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    user = await prismaClient.user.create({
      data: { email, name, photo: picture, googleId, password: "" },
    });
  } else if (!user.googleId) {
    user = await prismaClient.user.update({
      where: { id: user.id },
      data: { googleId, photo: picture || user.photo },
    });
  }

  const token = jwt.sign(
    { userId: user.id, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
}));

app.post("/signup", asyncHandler(async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Incorrect inputs", errors: parsedData.error });
    return;
  }

  const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });
    res.json({ userId: user.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      res.status(409).json({ message: "User already exists with this email" });
    } else {
      throw e;
    }
  }
}));

app.post("/signin", asyncHandler(async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Incorrect inputs" });
    return;
  }

  const user = await prismaClient.user.findFirst({
    where: { email: parsedData.data.username },
  });

  if (!user || !user.password) {
    res.status(403).json({ message: "Invalid credentials" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    parsedData.data.password,
    user.password
  );

  if (!isPasswordValid) {
    res.status(403).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
}));

app.post("/create-room", middleware, asyncHandler(async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid room visibility" });
    return;
  }

  // Generate a unique 3-word slug, retry if collision
  let slug = generateSlug();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prismaClient.room.findUnique({ where: { slug } });
    if (!existing) break;
    slug = generateSlug();
    attempts++;
  }

  const room = await prismaClient.room.create({
    data: {
      slug,
      adminId: req.userId!,
      visibility: parsedData.data.visibility,
    },
    select: { id: true, slug: true, visibility: true, createdAt: true },
  });

  res.json({
    roomId: room.id,
    slug: room.slug,
    visibility: room.visibility,
  });
}));

app.get("/room/:slug", middleware, asyncHandler(async (req, res) => {
  const param = req.params.slug as string;
  const isNumeric = !isNaN(Number(param));

  const room = await prismaClient.room.findFirst({
    where: {
      AND: [
        isNumeric ? { id: Number(param) } : { slug: param },
        roomAccessFilter(req.userId!),
      ],
    },
    select: {
      id: true,
      slug: true,
      visibility: true,
      createdAt: true,
      adminId: true,
    },
  });

  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  res.json({ room });
}));

app.get("/my-rooms", middleware, asyncHandler(async (req, res) => {
  const rooms = await prismaClient.room.findMany({
    where: {
      OR: [
        { adminId: req.userId },
        { collaborators: { some: { id: req.userId } } },
      ],
    },
    select: {
      id: true,
      slug: true,
      visibility: true,
      adminId: true,
      createdAt: true,
      collaborators: {
        select: { id: true, name: true, photo: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ rooms });
}));

app.delete("/room/:roomId", middleware, asyncHandler(async (req, res) => {
  const roomId = parseInt(req.params.roomId as string);

  if (Number.isNaN(roomId)) {
    res.status(400).json({ message: "Invalid room ID" });
    return;
  }

  const room = await prismaClient.room.findUnique({ where: { id: roomId } });

  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  if (room.adminId !== req.userId) {
    res.status(403).json({ message: "Only the room creator can delete this room" });
    return;
  }

  // No cascade configured on the schema, so clear dependent rows first.
  await prismaClient.$transaction([
    prismaClient.chat.deleteMany({ where: { roomId } }),
    prismaClient.shape.deleteMany({ where: { roomId } }),
    prismaClient.room.delete({ where: { id: roomId } }),
  ]);

  res.json({ message: "Room deleted" });
}));

app.post("/room/:roomId/leave", middleware, asyncHandler(async (req, res) => {
  const roomId = parseInt(req.params.roomId as string);

  if (Number.isNaN(roomId)) {
    res.status(400).json({ message: "Invalid room ID" });
    return;
  }

  const room = await prismaClient.room.findUnique({ where: { id: roomId } });

  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  if (room.adminId === req.userId) {
    res.status(400).json({ message: "Room owners cannot leave — delete the room instead" });
    return;
  }

  await prismaClient.room.update({
    where: { id: roomId },
    data: { collaborators: { disconnect: { id: req.userId! } } },
  });

  res.json({ message: "Left room" });
}));

app.post("/rooms/:roomId/add-collaborator", middleware, asyncHandler(async (req, res) => {
  const roomId = parseInt(req.params.roomId as string);
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const room = await prismaClient.room.findUnique({ where: { id: roomId } });

  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  if (room.adminId !== req.userId) {
    res.status(403).json({ message: "Only the room owner can add collaborators" });
    return;
  }

  if (room.visibility === "PUBLIC") {
    res.status(400).json({ message: "Public rooms do not require invitations" });
    return;
  }

  const userToAdd = await prismaClient.user.findFirst({ where: { email } });

  if (!userToAdd) {
    await mailer.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Invitation to join DrawSync",
      text: `You have been invited to collaborate! Sign up here: ${FRONTEND_URL}/signup`,
    });
    res.status(404).json({ message: "User not found, invitation sent!" });
    return;
  }

  await prismaClient.room.update({
    where: { id: roomId },
    data: { collaborators: { connect: { id: userToAdd.id } } },
  });

  res.json({ message: "Collaborator added successfully!" });
}));

app.get("/me", middleware, asyncHandler(async (req, res) => {
  const user = await prismaClient.user.findFirst({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, photo: true },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ user });
}));

app.put("/me", middleware, asyncHandler(async (req, res) => {
  const { name, photo } = req.body;

  const updatedUser = await prismaClient.user.update({
    where: { id: req.userId },
    data: { name, photo },
    select: { name: true, email: true, photo: true },
  });

  res.json({ message: "Profile updated", user: updatedUser });
}));

app.get("/chats/:slug", middleware, asyncHandler(async (req, res) => {
  const param = req.params.slug as string;
  const isNumeric = !isNaN(Number(param));
  const page = Number(req.query.page) || 1;
  const limit = 50;

  const room = await prismaClient.room.findFirst({
    where: {
      AND: [
        isNumeric ? { id: Number(param) } : { slug: param },
        roomAccessFilter(req.userId!),
      ],
    },
    select: { id: true },
  });

  if (!room) {
    res.status(404).json({ messages: [] });
    return;
  }

  const messages = await prismaClient.chat.findMany({
    where: { roomId: room.id },
    orderBy: { id: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  res.json({ messages });
}));

app.get("/rooms/:slug/shapes", middleware, asyncHandler(async (req, res) => {
  const param = req.params.slug as string;
  const isNumeric = !isNaN(Number(param));

  const roomWithShapes = await prismaClient.room.findFirst({
    where: {
      AND: [
        isNumeric ? { id: Number(param) } : { slug: param },
        roomAccessFilter(req.userId!),
      ],
    },
    include: { shapes: true },
  });

  if (!roomWithShapes) {
    res.status(404).json({ shapes: [] });
    return;
  }

  const shapes = roomWithShapes.shapes.map((s: any) => JSON.parse(s.data));
  res.json({ shapes });
}));

app.post("/rooms/:roomId/save", middleware, asyncHandler(async (req, res) => {
  const roomId = parseInt(req.params.roomId as string);
  const { elements } = req.body;

  if (Number.isNaN(roomId)) {
    res.status(400).json({ message: "Invalid room ID" });
    return;
  }

  if (!elements || !Array.isArray(elements)) {
    res.status(400).json({ message: "Elements required" });
    return;
  }

  const room = await prismaClient.room.findFirst({
    where: {
      id: roomId,
      ...roomAccessFilter(req.userId!),
    },
    select: { id: true },
  });

  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  const currentShapes = elements
    .filter((el: any) => el?.id && !el.isDeleted)
    .map((el: any) => ({
      id: el.id,
      roomId,
      data: JSON.stringify(el),
    }));

  await prismaClient.$transaction(async (tx) => {
    await tx.shape.deleteMany({ where: { roomId } });

    if (currentShapes.length > 0) {
      await tx.shape.createMany({ data: currentShapes });
    }
  });

  res.json({ message: "Saved", shapeCount: currentShapes.length });
}));

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

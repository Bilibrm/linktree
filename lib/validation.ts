import { z } from "zod"

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens")
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Username cannot start or end with a hyphen")
  .refine((val) => !val.startsWith("_") && !val.endsWith("_"), "Username cannot start or end with an underscore")

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  username: usernameSchema,
  name: z.string().max(60).optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const blockDataSchemas = {
  link: z.object({
    title: z.string().min(1, "Title is required").max(100),
    url: z.string().url("Invalid URL").max(2000),
    icon: z.string().max(100).optional(),
    thumbnailUrl: z.string().max(2000).optional(),
    featured: z.boolean().optional(),
  }),
  header: z.object({
    text: z.string().min(1).max(200),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(2),
  }),
  text: z.object({
    content: z.string().min(1).max(5000),
    align: z.union([z.literal("left"), z.literal("center"), z.literal("right")]).optional().default("center"),
  }),
  divider: z.object({}).optional().default({}),
  social: z.object({
    links: z
      .array(
        z.object({
          platform: z.string().min(1),
          url: z.string().url("Invalid URL"),
        })
      )
      .max(20),
  }),
  image: z.object({
    src: z.string().url().min(1),
    alt: z.string().max(200).optional(),
    caption: z.string().max(200).optional(),
  }),
  gallery: z.object({
    images: z
      .array(
        z.object({
          src: z.string().url().min(1),
          alt: z.string().max(200).optional(),
        })
      )
      .min(1)
      .max(20),
  }),
  embed: z.object({
    url: z.string().url("Invalid URL"),
    type: z.union([z.literal("youtube"), z.literal("spotify"), z.literal("soundcloud"), z.literal("tiktok"), z.literal("other")]).optional(),
  }),
  form: z.object({
    title: z.string().max(200).optional(),
    fields: z
      .array(
        z.object({
          label: z.string().min(1).max(100),
          type: z.union([z.literal("text"), z.literal("email"), z.literal("textarea"), z.literal("select")]),
          required: z.boolean().default(false),
          options: z.array(z.string()).optional(),
        })
      )
      .min(1)
      .max(20),
    buttonText: z.string().max(50).optional().default("Submit"),
  }),
  countdown: z.object({
    title: z.string().min(1).max(200),
    targetDate: z.string().min(1, "Target date is required"),
    emoji: z.string().max(10).optional(),
  }),
} as const

export const createBlockSchema = z.object({
  pageId: z.string().min(1),
  type: z.enum(["link", "header", "text", "divider", "social", "image", "gallery", "embed", "form", "countdown"]),
  data: z.record(z.string(), z.unknown()),
  order: z.number().int().min(0).optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
})

export const updateBlockSchema = z.object({
  data: z.record(z.string(), z.unknown()).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
})

export const reorderBlocksSchema = z.object({
  blocks: z.array(
    z.object({
      _id: z.string().min(1),
      order: z.number().int().min(0),
    })
  ),
})

export const themeSchema = z.object({
  preset: z.string(),
  backgroundColor: z.string().optional(),
  backgroundType: z.string().optional(),
  backgroundValue: z.string().optional(),
  backgroundDirection: z.string().optional(),
  backgroundStops: z.array(z.object({ color: z.string(), position: z.number() })).optional(),
  font: z.string().optional(),
  buttonStyle: z.string().optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  accentColor: z.string().optional(),
  linkStyle: z.string().optional(),
  linkHover: z.string().optional(),
  socialIconStyle: z.string().optional(),
  borderRadius: z.string().optional(),
  shadow: z.string().optional(),
  avatarShape: z.string().optional(),
  layoutWidth: z.string().optional(),
  animation: z.string().optional(),
  backgroundBlur: z.boolean().optional(),
  spacingDensity: z.string().optional(),
  customCSS: z.string().optional(),
})

export const pageSettingsSchema = z.object({
  title: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  theme: themeSchema.optional(),
  seo: z
    .object({
      title: z.string().max(120).optional(),
      description: z.string().max(320).optional(),
      ogImageUrl: z.string().max(2000).optional(),
    })
    .optional(),
  isPublished: z.boolean().optional(),
  visibility: z.enum(["public", "unlisted", "password"]).optional(),
  password: z.string().min(1).max(128).optional(),
})

export const formSubmissionSchema = z.object({
  blockId: z.string().min(1),
  pageId: z.string().min(1),
  data: z.record(z.string(), z.string()),
})

export const trackClickSchema = z.object({
  blockId: z.string().min(1),
  pageId: z.string().min(1),
  referrer: z.string().optional(),
})

export function validateBlockData(type: string, data: unknown) {
  const schema = blockDataSchemas[type as keyof typeof blockDataSchemas]
  if (!schema) {
    if (type === "divider") return { success: true as const, data: {} }
    throw new Error(`Unknown block type: ${type}`)
  }
  return schema.safeParse(data)
}

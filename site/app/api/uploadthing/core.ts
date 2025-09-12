import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();
//TODO: Implement an actual auth check
const auth = () => ({ id: "test-user" });

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const user = auth();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(" Upload complete:", {
        userId: metadata.userId,
        fileName: file.name,
        fileUrl: file.ufsUrl,
        fileKey: file.key,
      });

      // Return minimal response
      return { success: true, url: file.ufsUrl };
    }),
  documentUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const user = auth();
      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(" Upload complete:", {
        userId: metadata.userId,
        fileName: file.name,
        fileUrl: file.ufsUrl,
        fileKey: file.key,
      });

      // Return minimal response
      return { success: true, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

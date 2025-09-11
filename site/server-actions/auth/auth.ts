// lib/actions/auth.ts
"use server";
import {
  loginSchema,
  investorRegistrationSchema,
  agencyRegistrationSchema,
  passwordChangeSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from "@/types/auth";
import { UserModel } from "@/db/models/user";
import { TokenModel } from "@/db/models/token";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/utils/email";
import { formatZodErrors } from "@/lib/zod";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
export type AuthActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Login action
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<{
  success: boolean;
  message: string;
  token?: string;
  role?: string;
}> {
  try {
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return { success: false, message: "Invalid email or password format." };
    }

    const result = await UserModel.login(
      validatedFields.data.email,
      validatedFields.data.password,
    );
    if (!result.success) {
      return { success: false, message: result.message || "Login failed." };
    }
    const user = await UserModel.findByEmail(validatedFields.data.email);
    if (!user?.emailVerified) {
      return {
        success: false,
        message: "Please verify your email before logging in.",
      };
    }
    const token = jwt.sign(
      {
        email: validatedFields.data.email,
        userId: result.userId,
        role: result.role,
      },
      JWT_SECRET!,
      { algorithm: "HS256", expiresIn: "24h", issuer: "Atria" },
    );
    await setJwt(token);
    return {
      success: true,
      message: "Login successful!",
      role: result.role,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    };
  }
}

// Logout action
export async function logout() {
  try {
    await deleteJwt();
    redirect("/auth/login");
  } catch (error) {
    console.error("Logout error:", error);
    redirect("/auth/login");
  }
}

// Investor registration action
export async function registerInvestor(
  prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const validatedFields = investorRegistrationSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      publicKey: formData.get("publicKey"),
      phoneNumber: formData.get("phoneNumber") || undefined,
      acceptTerms: formData.get("acceptTerms") === "on",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(validatedFields.error),
      };
    }

    const { email, publicKey, ...userData } = validatedFields.data;

    // Check if email already exists
    const existingUser = await UserModel.emailExists(email);
    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    // Check if public key already exists
    const existingPublicKey = await UserModel.publicKeyExists(publicKey);
    if (existingPublicKey) {
      return {
        success: false,
        message: "This public key is already registered.",
      };
    }

    // Create user
    const newUser = await UserModel.create({
      ...userData,
      email,
      publicKey,
      role: "INVESTOR",
      kycStatus: "NOT_STARTED",
    });

    // Generate email verification token
    const verificationToken = await TokenModel.createToken(
      email,
      "EMAIL_VERIFICATION",
      24 * 60 * 60 * 1000, // 24 hours
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken, userData.firstName);

    return {
      success: true,
      message:
        "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Investor registration error:", error);
    return {
      success: false,
      message: "Something went wrong during registration. Please try again.",
    };
  }
}

// Agency registration action
export async function registerAgency(
  prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const validatedFields = agencyRegistrationSchema.safeParse({
      companyName: formData.get("companyName"),
      tradingName: formData.get("tradingName") || undefined,
      registrationNumber: formData.get("registrationNumber"),
      licenseNumber: formData.get("licenseNumber"),
      taxId: formData.get("taxId"),
      establishedDate: formData.get("establishedDate"),
      contactPerson: {
        firstName: formData.get("contactFirstName"),
        lastName: formData.get("contactLastName"),
        position: formData.get("contactPosition"),
        email: formData.get("contactEmail"),
        phoneNumber: formData.get("contactPhone"),
      },
      businessAddress: {
        street: formData.get("businessStreet"),
        city: formData.get("businessCity"),
        state: formData.get("businessState"),
        zipCode: formData.get("businessZipCode"),
        country: formData.get("businessCountry"),
      },
      businessType: formData.get("businessType"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      description: formData.get("description") || undefined,
      website: formData.get("website") || undefined,
      acceptTerms: formData.get("acceptTerms") === "on",
    });

    if (!validatedFields.success) {
      // console.log("Validation errors:", formatZodErrors(validatedFields.error));
      return {
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(validatedFields.error),
      };
    }

    const { email, registrationNumber, ...userData } = validatedFields.data;

    // Check if email already exists
    const existingUser = await UserModel.emailExists(email);
    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    // Check if registration number already exists
    const existingRegistration =
      await UserModel.registrationNumberExists(registrationNumber);
    if (existingRegistration) {
      return {
        success: false,
        message: "This business registration number is already registered.",
      };
    }

    // Create agency user
    const newUser = await UserModel.create({
      ...userData,
      email,
      registrationNumber,
      role: "AGENCY",
      establishedDate: new Date(userData.establishedDate),
      verificationDocuments: {
        businessRegistration: "",
        businessLicense: "",
        taxCertificate: "",
        proofOfAddress: "",
        bankStatement: "",
      },
      compliance: {
        amlCompliant: false,
        gdprCompliant: false,
        localRegulationsCompliant: false,
      },
    });

    // Generate email verification token
    const verificationToken = await TokenModel.createToken(
      email,
      "EMAIL_VERIFICATION",
      24 * 60 * 60 * 1000, // 24 hours
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken, userData.companyName);
    // console.log("Sent verification email to:", email);
    return {
      success: true,
      message:
        "Agency account created successfully! Please check your email to verify your account and prepare your business documents for verification.",
    };
  } catch (error) {
    console.error("Agency registration error:", error);
    return {
      success: false,
      message: "Something went wrong during registration. Please try again.",
    };
  }
}

// Email verification action
export async function verifyEmail(token: string): Promise<AuthActionResult> {
  try {
    const email = await TokenModel.verifyToken(token, "EMAIL_VERIFICATION");

    if (!email) {
      return {
        success: false,
        message: "Invalid or expired verification token.",
      };
    }

    // Find user by email and mark as verified
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    await UserModel.updateById(user._id.toString(), {
      emailVerified: true,
    });

    return {
      success: true,
      message:
        "Email verified successfully! You can now sign in to your account.",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      message: "Something went wrong during email verification.",
    };
  }
}

// Resend verification email action
export async function resendVerificationEmail(
  email: string,
): Promise<AuthActionResult> {
  try {
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return {
        success: false,
        message: "No account found with this email address.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "This email is already verified.",
      };
    }

    // Generate new verification token
    const verificationToken = await TokenModel.createToken(
      email,
      "EMAIL_VERIFICATION",
      24 * 60 * 60 * 1000, // 24 hours
    );

    // Send verification email
    const userName =
      user.role === "AGENCY"
        ? user.companyName
        : user.role === "INVESTOR"
          ? user.firstName
          : user.firstName;

    await sendVerificationEmail(email, verificationToken, userName);

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      message: "Failed to send verification email. Please try again.",
    };
  }
}

// Password reset request action
export async function requestPasswordReset(
  prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const validatedFields = passwordResetRequestSchema.safeParse({
      email: formData.get("email"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please enter a valid email address.",
        errors: formatZodErrors(validatedFields.error),
      };
    }

    const { email } = validatedFields.data;
    const user = await UserModel.findByEmail(email);

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return {
        success: true,
        message:
          "If an account with this email exists, you will receive a password reset link.",
      };
    }

    // Generate password reset token
    const resetToken = await TokenModel.createToken(
      email,
      "PASSWORD_RESET",
      60 * 60 * 1000, // 1 hour
    );

    // Send password reset email
    const userName =
      user.role === "AGENCY"
        ? user.companyName
        : user.role === "INVESTOR"
          ? user.firstName
          : user.firstName;

    await sendPasswordResetEmail(email, resetToken, userName);

    return {
      success: true,
      message:
        "If an account with this email exists, you will receive a password reset link.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

// Password reset confirmation action
export async function confirmPasswordReset(
  token: string,
  prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const validatedFields = passwordResetConfirmSchema.safeParse({
      token,
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(validatedFields.error),
      };
    }

    const { password } = validatedFields.data;

    // Verify reset token
    const email = await TokenModel.verifyToken(token, "PASSWORD_RESET");
    if (!email) {
      return {
        success: false,
        message: "Invalid or expired reset token.",
      };
    }

    // Find user and update password
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    await UserModel.changePassword(user._id.toString(), password);

    return {
      success: true,
      message:
        "Password reset successfully! You can now sign in with your new password.",
    };
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return {
      success: false,
      message: "Something went wrong during password reset.",
    };
  }
}

// Change password action (for authenticated users)
export async function changePassword(
  userId: string,
  prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    const validatedFields = passwordChangeSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmNewPassword: formData.get("confirmNewPassword"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(validatedFields.error),
      };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // Verify current password
    const isCurrentPasswordValid = await UserModel.verifyPassword(
      userId,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: "Current password is incorrect.",
      };
    }

    // Update password
    await UserModel.changePassword(userId, newPassword);

    return {
      success: true,
      message: "Password changed successfully!",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "Something went wrong during password change.",
    };
  }
}
async function setJwt(token: string) {
  (await cookies()).set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });
}
export async function deleteJwt() {
  (await cookies()).delete("accessToken");
}
export async function getJwt() {
  return (await cookies()).get("accessToken")?.value;
}
export async function verifyJwt() {
  try {
    const token = await getJwt();
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET!) as {
      email: string;
      userId: string;
      role: string;
      exp: number;
    };

    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    await deleteJwt(); // Clear invalid token
    return null;
  }
}

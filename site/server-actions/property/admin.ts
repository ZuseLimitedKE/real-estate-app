"use server";
//TODO: renixvi is supposed to continue this file
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UserModel } from "@/db/models/user";
import {
  agencyApprovalSchema,
  adminUserCreationSchema,
  User,
  UserStatus,
  AgencyUser,
} from "@/types/auth";
import {
  sendAgencyApprovalEmail,
  sendAgencyRejectionEmail,
} from "@/lib/utils/email";

export type AdminActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Check if user is admin
async function checkAdminAccess() {
  // const session = await auth();
  // if (!session?.user || session.user.role !== 'ADMIN') {
  //     redirect('/unauthorized');
  // }
  // return session.user;
}

// Get pending agencies for approval
export async function getPendingAgencies(
  limit: number = 10,
  skip: number = 0,
): Promise<AgencyUser[]> {
  await checkAdminAccess();

  try {
    const agencies = await UserModel.findPendingAgencies(limit, skip);
    return agencies as AgencyUser[];
  } catch (error) {
    console.error("Error fetching pending agencies:", error);
    return [];
  }
}

// Approve agency
export async function approveAgency(
  prevState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    const validatedFields = agencyApprovalSchema.safeParse({
      agencyId: formData.get("agencyId"),
      status: "APPROVED",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid agency ID",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { agencyId } = validatedFields.data;

    // Find the agency
    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== "AGENCY") {
      return {
        success: false,
        message: "Agency not found",
      };
    }

    if (agency.status !== "PENDING") {
      return {
        success: false,
        message: "Agency is not in a pending state",
      };
    }

    // Update agency status
    const updatedAgency = await UserModel.updateStatus(
      agencyId,
      "APPROVED",
      admin.id,
    );
    if (!updatedAgency) {
      return {
        success: false,
        message: "Failed to update agency status",
      };
    }

    // Send approval email
    await sendAgencyApprovalEmail(
      agency.email,
      (agency as AgencyUser).companyName,
    );

    revalidatePath("/admin/agencies");

    return {
      success: true,
      message: `Agency "${(agency as AgencyUser).companyName}" has been approved successfully.`,
    };
  } catch (error) {
    console.error("Agency approval error:", error);
    return {
      success: false,
      message: "Something went wrong during agency approval.",
    };
  }
}

// Reject agency
export async function rejectAgency(
  prevState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    const validatedFields = agencyApprovalSchema.safeParse({
      agencyId: formData.get("agencyId"),
      status: "REJECTED",
      rejectionReason: formData.get("rejectionReason"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { agencyId, rejectionReason } = validatedFields.data;

    if (!rejectionReason) {
      return {
        success: false,
        message: "Rejection reason is required",
      };
    }

    // Find the agency
    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== "AGENCY") {
      return {
        success: false,
        message: "Agency not found",
      };
    }

    // Update agency status
    const updatedAgency = await UserModel.updateStatus(
      agencyId,
      "REJECTED",
      admin.id,
      rejectionReason,
    );

    if (!updatedAgency) {
      return {
        success: false,
        message: "Failed to update agency status",
      };
    }

    // Send rejection email
    await sendAgencyRejectionEmail(
      agency.email,
      (agency as AgencyUser).companyName,
      rejectionReason,
    );

    revalidatePath("/admin/agencies");

    return {
      success: true,
      message: `Agency "${(agency as AgencyUser).companyName}" has been rejected.`,
    };
  } catch (error) {
    console.error("Agency rejection error:", error);
    return {
      success: false,
      message: "Something went wrong during agency rejection.",
    };
  }
}

// Suspend user
export async function suspendUser(
  userId: string,
  reason: string,
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Cannot suspend another admin (unless super admin)
    const adminUser = await UserModel.findById(admin.id);
    if (user.role === "ADMIN" && (!adminUser || !(adminUser as any).isSuper)) {
      return {
        success: false,
        message: "You cannot suspend another admin user",
      };
    }

    await UserModel.updateStatus(userId, "SUSPENDED", admin.id, reason);

    const userName =
      user.role === "AGENCY"
        ? (user as AgencyUser).companyName
        : user.role === "INVESTOR"
          ? `${(user as any).firstName} ${(user as any).lastName}`
          : `${(user as any).firstName} ${(user as any).lastName}`;

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User "${userName}" has been suspended.`,
    };
  } catch (error) {
    console.error("User suspension error:", error);
    return {
      success: false,
      message: "Something went wrong during user suspension.",
    };
  }
}

// Reactivate user
export async function reactivateUser(
  userId: string,
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await UserModel.updateStatus(userId, "APPROVED", admin.id);

    const userName =
      user.role === "AGENCY"
        ? (user as AgencyUser).companyName
        : user.role === "INVESTOR"
          ? `${(user as any).firstName} ${(user as any).lastName}`
          : `${(user as any).firstName} ${(user as any).lastName}`;

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User "${userName}" has been reactivated.`,
    };
  } catch (error) {
    console.error("User reactivation error:", error);
    return {
      success: false,
      message: "Something went wrong during user reactivation.",
    };
  }
}

// Create admin user
export async function createAdminUser(
  prevState: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    // Check if current admin is super admin
    const currentAdmin = await UserModel.findById(admin.id);
    if (!currentAdmin || !(currentAdmin as any).isSuper) {
      return {
        success: false,
        message: "Only super administrators can create admin users",
      };
    }

    const validatedFields = adminUserCreationSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      permissions: formData.getAll("permissions"),
      department: formData.get("department") || undefined,
      isSuper: formData.get("isSuper") === "on",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { email, ...userData } = validatedFields.data;

    // Check if email already exists
    const existingUser = await UserModel.emailExists(email);
    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    // Create admin user
    const newAdmin = await UserModel.create({
      ...userData,
      email,
      role: "ADMIN",
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `Admin user "${userData.firstName} ${userData.lastName}" created successfully.`,
    };
  } catch (error) {
    console.error("Admin creation error:", error);
    return {
      success: false,
      message: "Something went wrong during admin creation.",
    };
  }
}

// Get user statistics
export async function getUserStatistics() {
  await checkAdminAccess();

  try {
    const stats = await UserModel.getUserStats();
    return stats;
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return [];
  }
}

// Search users
export async function searchUsers(
  query: string,
  role?: string,
  status?: string,
  limit: number = 20,
  skip: number = 0,
): Promise<User[]> {
  await checkAdminAccess();

  try {
    const { db } =
      await require("@/lib/database/connection").connectToDatabase();
    const collection = db.collection("users");

    const searchFilter: any = {};

    // Add text search if query provided
    if (query.trim()) {
      searchFilter.$or = [
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { companyName: { $regex: query, $options: "i" } },
      ];
    }

    // Add role filter
    if (role && role !== "all") {
      searchFilter.role = role;
    }

    // Add status filter
    if (status && status !== "all") {
      searchFilter.status = status;
    }

    const users = await collection
      .find(searchFilter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .toArray();

    return users as User[];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

// Delete user (soft delete by marking as deleted)
export async function deleteUser(userId: string): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Cannot delete another admin (unless super admin)
    const adminUser = await UserModel.findById(admin.id);
    if (user.role === "ADMIN" && (!adminUser || !(adminUser as any).isSuper)) {
      return {
        success: false,
        message: "You cannot delete another admin user",
      };
    }

    // Instead of hard delete, mark as deleted
    await UserModel.updateById(userId, {
      status: "SUSPENDED",
      deletedAt: new Date(),
      deletedBy: admin.id,
    } as any);

    const userName =
      user.role === "AGENCY"
        ? (user as AgencyUser).companyName
        : user.role === "INVESTOR"
          ? `${(user as any).firstName} ${(user as any).lastName}`
          : `${(user as any).firstName} ${(user as any).lastName}`;

    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User "${userName}" has been deleted.`,
    };
  } catch (error) {
    console.error("User deletion error:", error);
    return {
      success: false,
      message: "Something went wrong during user deletion.",
    };
  }
}

// Get agency details for review
export async function getAgencyDetails(
  agencyId: string,
): Promise<AgencyUser | null> {
  await checkAdminAccess();

  try {
    const agency = await UserModel.findById(agencyId);
    if (!agency || agency.role !== "AGENCY") {
      return null;
    }
    return agency as AgencyUser;
  } catch (error) {
    console.error("Error fetching agency details:", error);
    return null;
  }
}

// Bulk approve agencies
export async function bulkApproveAgencies(
  agencyIds: string[],
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    let successCount = 0;
    let failureCount = 0;

    for (const agencyId of agencyIds) {
      try {
        const agency = await UserModel.findById(agencyId);
        if (agency && agency.role === "AGENCY" && agency.status === "PENDING") {
          await UserModel.updateStatus(agencyId, "APPROVED", admin.id);

          // Send approval email
          await sendAgencyApprovalEmail(
            agency.email,
            (agency as AgencyUser).companyName,
          );

          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error(`Error approving agency ${agencyId}:`, error);
        failureCount++;
      }
    }

    revalidatePath("/admin/agencies");

    return {
      success: true,
      message: `Bulk approval completed. ${successCount} agencies approved, ${failureCount} failed.`,
    };
  } catch (error) {
    console.error("Bulk agency approval error:", error);
    return {
      success: false,
      message: "Something went wrong during bulk approval.",
    };
  }
}

// Update user permissions (admin only)
export async function updateUserPermissions(
  userId: string,
  permissions: string[],
): Promise<AdminActionResult> {
  const admin = await checkAdminAccess();

  try {
    // Check if current admin is super admin
    const currentAdmin = await UserModel.findById(admin.id);
    if (!currentAdmin || !(currentAdmin as any).isSuper) {
      return {
        success: false,
        message: "Only super administrators can update user permissions",
      };
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Admin user not found",
      };
    }

    await UserModel.updateById(userId, {
      permissions,
      updatedAt: new Date(),
    } as any);

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User permissions updated successfully.",
    };
  } catch (error) {
    console.error("Permission update error:", error);
    return {
      success: false,
      message: "Something went wrong during permission update.",
    };
  }
}

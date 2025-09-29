"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { logout } from "@/server-actions/auth/auth";
import { NavbarButton } from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "dark" | "gradient";
  className?: string;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function LogoutButton({
  variant = "primary",
  className,
  onLogoutStart,
  onLogoutComplete,
  onCancel,
  children = "Logout",
  size = "md",
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      onLogoutStart?.();

      await logout();

      onLogoutComplete?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel?.();
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-xs";
      case "lg":
        return "px-6 py-3 text-base";
      default:
        return "px-4 py-2 text-sm";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <NavbarButton
          variant={variant}
          as="button"
          className={cn(getSizeClasses(), className)}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : children}
        </NavbarButton>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg ">
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            Are you sure you want to log out? You'll need to sign in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="hover:text-black hover:bg-slate-50 cursor-pointer "
            onClick={handleCancel}
            disabled={isLoggingOut}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoggingOut ? (
              <Spinner size="small" className="text-white" />
            ) : (
              "Yes"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

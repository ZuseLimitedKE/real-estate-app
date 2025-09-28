"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MyError } from "@/constants/errors";
import { DeleteAgencyProperty } from "@/server-actions/agent/dashboard/deleteProperty";
import { MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
export function AgentPropertiesDropdown({ id }: { id: string }) {
  const handleDeleteProperty = async () => {
    try {
      await DeleteAgencyProperty(id);
      toast.success("The property has been deleted");
    } catch (err) {
      console.error(err);
      if (err instanceof MyError) {
        toast.error(err.message);
      } else {
        toast.error("unable to delete the property");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-slate-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            href={`/agencies/properties/${id}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive/80 hover:text-destructive hover:bg-slate-50"
          onClick={handleDeleteProperty}
        >
          <Trash className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

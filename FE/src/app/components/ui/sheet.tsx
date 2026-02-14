"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "./utils";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-xl transition-all",

          side === "right" &&
            "inset-y-0 right-0 border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",

          side === "left" &&
            "inset-y-0 left-0 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",

          side === "top" &&
            "inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top",

          side === "bottom" &&
            "inset-x-0 bottom-0 border-t data-[state=open]:slide-in-from-bottom",

          className,
        )}
        {...props}
      >
        {children}

        <SheetPrimitive.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100">
          <XIcon className="w-4 h-4" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader(props: React.ComponentProps<"div">) {
  return <div className="p-4 border-b" {...props} />;
}

function SheetTitle(props: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className="font-semibold" {...props} />;
}

function SheetDescription(
  props: React.ComponentProps<typeof SheetPrimitive.Description>,
) {
  return <SheetPrimitive.Description className="text-sm text-muted-foreground" {...props} />;
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};

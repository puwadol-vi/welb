"use client";

import Image from "next/image";
import { LogIn, LogOut } from "lucide-react";
import type { User } from "firebase/auth";

export type FloatingAuthButtonProps = {
  user: User | null;
  onSignIn: () => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
};

export function FloatingAuthButton({
  user,
  onSignIn,
  onSignOut,
}: FloatingAuthButtonProps) {
  const content = user ? (
    <>
      {user.photoURL && (
        <Image
          src={user.photoURL}
          alt={user.displayName ?? "User"}
          width={32}
          height={32}
          className={"h-8 w-8 rounded-full"}
        />
      )}
      <button
        type="button"
        onClick={() => onSignOut()}
        className={
          "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ring-1 ring-border"
        }
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </>
  ) : (
    <button
      type="button"
      onClick={() => onSignIn()}
      className={
        "flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
      }
      aria-label="Sign in with Google"
    >
      <LogIn className="h-4 w-4" />
    </button>
  );

  return <div className="mr-2 flex items-center gap-2">{content}</div>;
}

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, LogOut, Calendar, MapPin } from "lucide-react";
import type { User } from "firebase/auth";

export type FloatingAuthButtonProps = {
  user: User | null;
  onSignIn: () => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
  organizer?: string;
};

export function FloatingAuthButton({
  user,
  onSignIn,
  onSignOut,
  organizer = "",
}: FloatingAuthButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [dropdownOpen]);

  const hasAdminAccess = organizer !== "";
  const avatarNode = user?.photoURL ? (
    <Image
      src={user.photoURL}
      alt={user.displayName ?? "User"}
      width={32}
      height={32}
      className="h-8 w-8 rounded-full"
    />
  ) : null;

  const content = user ? (
    <>
      {(user.photoURL || hasAdminAccess) && (
        <div className="relative" ref={dropdownRef}>
          {hasAdminAccess ? (
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="rounded-full ring-2 ring-transparent hover:ring-border focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Admin menu"
              aria-expanded={dropdownOpen}
            >
              {avatarNode ?? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  {user.email?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </button>
          ) : (
            <span className="block">{avatarNode}</span>
          )}
          {hasAdminAccess && dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg">
              <Link
                href="/admin/events"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setDropdownOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                Event Admin Page
              </Link>
              <Link
                href="/admin/spots"
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setDropdownOpen(false)}
              >
                <MapPin className="h-4 w-4" />
                Spot Admin Page
              </Link>
            </div>
          )}
        </div>
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

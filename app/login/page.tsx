import Link from "next/link";
import { safeNext, supabaseConfigured } from "@/lib/supabase/config";
import { sendMagicLink, signInWithGoogle, signInWithPassword, signUp } from "./actions";

export const metadata = { title: "Sign in: White Room" };

const ERRORS: Record<string, string> = {
  credentials: "That email and password don't match. Check them, or sign in with an email link instead.",
  signup: "We couldn't create the account. The email may already be registered; try signing in.",
  link: "That sign-in link has expired or was already used. Request a new one below.",
  google: "Google sign-in didn't complete. Try again, or use your email.",
  setup: "Sign-in isn't switched on for this demo yet.",
};

const SENT: Record<string, string> = {
  link: "Check your inbox. We sent a sign-in link that works for one hour.",
  confirm: "Check your inbox to confirm your email, then you'll be signed in.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; sent?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const { error, sent, mode } = params;
  const isSignup = mode === "signup";
  const nq = encodeURIComponent(next);
  // Google needs its own setup in Supabase, so the button waits for this switch.
  const googleOn = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "true";

  return (
    <div className="mx-auto max-w-md px-5 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl">{isSignup ? "Create your account" : "Sign in to White Room"}</h1>
      <p className="mt-3 text-graphite">
        {isSignup
          ? "Book stays for yourself or your family, and keep every invoice in one place."
          : "See your stays, invoices and move-in details."}
      </p>

      {error && ERRORS[error] && (
        <p role="alert" className="mt-6 rounded-xl bg-alertsoft p-4 text-sm font-medium text-alert">
          {ERRORS[error]}
        </p>
      )}
      {sent && SENT[sent] && (
        <p role="status" className="mt-6 rounded-xl bg-sealsoft p-4 text-sm font-medium text-ink">
          {SENT[sent]}
        </p>
      )}

      {!supabaseConfigured ? (
        <div className="panel mt-6 p-5 text-sm text-graphite">
          Accounts need Supabase keys, which aren&apos;t set on this deployment. The rest of the demo works without signing in.
          <div className="mt-4">
            <Link href="/stays" className="btn btn-primary btn-sm">
              Find a stay
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel mt-6 space-y-6 p-5 md:p-6">
          {googleOn && (
            <>
              <form action={signInWithGoogle}>
                <input type="hidden" name="next" value={next} />
                <button type="submit" className="btn btn-quiet w-full">
                  Continue with Google
                </button>
              </form>

              <p className="flex items-center gap-3 text-sm text-graphite before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
                or use your email
              </p>
            </>
          )}

          <form action={isSignup ? signUp : signInWithPassword} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            {isSignup && (
              <div>
                <label htmlFor="full_name" className="label">Full name</label>
                <input id="full_name" name="full_name" type="text" autoComplete="name" required className="field" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="field" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                className="field"
              />
              {isSignup && <p className="mt-1 text-xs text-graphite">At least 8 characters.</p>}
            </div>
            <button type="submit" className="btn btn-primary w-full">
              {isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          {!isSignup && (
            <form action={sendMagicLink} className="space-y-3 border-t border-line pt-5">
              <input type="hidden" name="next" value={next} />
              <div>
                <label htmlFor="link-email" className="label">No password? Get a sign-in link</label>
                <input id="link-email" name="email" type="email" autoComplete="email" required className="field" />
              </div>
              <button type="submit" className="btn btn-quiet w-full">
                Email me a link
              </button>
            </form>
          )}
        </div>
      )}

      {supabaseConfigured && (
        <p className="mt-6 text-sm text-graphite">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href={`/login?next=${nq}`} className="font-semibold text-seal hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New to White Room?{" "}
              <Link href={`/login?mode=signup&next=${nq}`} className="font-semibold text-seal hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}

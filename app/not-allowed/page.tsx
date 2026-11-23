import Link from "next/link";

export const metadata = { title: "No access: White Room" };

export default function NotAllowed() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <div className="drafting rounded-[28px] border border-line px-6 py-12 md:px-10">
        <h1 className="text-3xl md:text-4xl">This page is for owners and the verification team</h1>
        <p className="mt-3 text-graphite">
          Your account doesn&apos;t have access. If you have a question, send us a message.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-primary">
            Contact us
          </Link>
          <Link href="/stays" className="btn btn-quiet">
            Find a stay
          </Link>
        </div>
      </div>
    </div>
  );
}

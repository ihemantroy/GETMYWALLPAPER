import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA & Takedown",
  description: "DMCA copyright policy for GetYourWallpaper. Submit a takedown or credit request and we will respond promptly.",
  alternates: { canonical: "/dmca" },
};

export default function DmcaPage() {
  return (
    <article className="mx-auto max-w-2xl px-6 pb-16 pt-28">
      <h1 className="font-display text-4xl font-bold tracking-tight">DMCA &amp; Takedown Policy</h1>
      <div className="mt-6 space-y-4 text-chalk-muted">
        <p>
          GetYourWallpaper respects the intellectual property of others and responds to valid copyright
          complaints. If you own the rights to a wallpaper on this site and believe it has been used
          without authorization, you can request its removal.
        </p>
        <h2 className="pt-2 font-display text-xl font-semibold text-chalk">How to file a request</h2>
        <p>
          Email <a href="mailto:ihemantroy@gmail.com" className="text-chalk underline">ihemantroy@gmail.com</a>{" "}
          with the subject line &quot;DMCA Takedown&quot; and include:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>The exact URL(s) of the wallpaper(s) in question.</li>
          <li>Proof or description of your ownership of the work.</li>
          <li>Your contact details (name and email).</li>
          <li>
            A statement that you have a good-faith belief the use is not authorized by the copyright owner,
            its agent, or the law.
          </li>
        </ul>
        <p>
          We aim to review and, where valid, remove the reported content promptly — typically within a few
          business days.
        </p>
        <h2 className="pt-2 font-display text-xl font-semibold text-chalk">Credit requests</h2>
        <p>
          If you are the creator of a wallpaper and would simply like proper credit or a link added, email us
          at the same address and we will update it.
        </p>
        <p>
          Contact:{" "}
          <a href="mailto:ihemantroy@gmail.com" className="text-chalk underline">ihemantroy@gmail.com</a>
        </p>
      </div>
    </article>
  );
}

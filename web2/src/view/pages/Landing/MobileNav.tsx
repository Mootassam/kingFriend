import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";
import { cx, sectionLinks } from "src/view/pages/Landing/landingClasses";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={cx("mobileNav")}>
      <button
        type="button"
        className={cx("mobileNavToggle")}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <>
          <button type="button" className={cx("mobileNavBackdrop")} aria-label="Close menu" onClick={close} />
          <div id="mobile-nav-panel" role="navigation" className={cx("mobileNavPanel")} aria-label="Mobile navigation">
            <CinematicLink href="/login" className={cx("mobileTile", "mobileTilePrimary")} onClick={close}>
              Login <ArrowRight size={16} />
            </CinematicLink>
            <CinematicLink href="/login" className={cx("mobileTile", "mobileTileAccent")} onClick={close}>
              Open Account <ArrowRight size={16} />
            </CinematicLink>
            {sectionLinks.map((link) => (
              <a key={link.href} href={link.href} className={cx("mobileTile")} onClick={close}>
                {link.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

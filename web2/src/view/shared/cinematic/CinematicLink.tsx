import { AnchorHTMLAttributes, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useCinematicNav } from "src/view/shared/cinematic/CinematicProvider";

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  duration?: number;
}

export default function CinematicLink({ href, duration, onClick, ...rest }: Props) {
  const { go } = useCinematicNav();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey || event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    go(href, duration);
  };

  return <Link to={href} onClick={handleClick} {...rest} />;
}

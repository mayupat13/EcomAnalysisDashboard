import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { ComponentProps, forwardRef, MouseEvent, ReactNode } from 'react';

type NextLinkProps = ComponentProps<typeof NextLink>;

export interface CustomLinkProps extends NextLinkProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
}

const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ children, className = '', onClick, href, ...rest }, ref) => {
    const router = useRouter();

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (onClick) {
        e.preventDefault();
        onClick(e);
      } else if (href) {
        e.preventDefault();
        router.push(href);
      }
    };

    return (
      <NextLink href={href} {...rest} className={className} onClick={handleClick} ref={ref}>
        {children}
      </NextLink>
    );
  },
);

Link.displayName = 'Link';

export default Link;

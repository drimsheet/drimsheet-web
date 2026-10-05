import { Moon, Sun } from 'lucide-react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

import {
  EAppThemePreference,
  type UAppThemePreference,
} from '@/shared/lib/api/Api';
import { storageService } from '@/shared/lib/services/storage.service';
import { cn } from '@/shared/lib/utils/cn';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
  onThemeChange?: (theme: Exclude<UAppThemePreference, 'system'>) => void;
  showText?: boolean;
}

export const AnimatedThemeToggler = forwardRef<
  HTMLButtonElement,
  AnimatedThemeTogglerProps
>(
  (
    { className, duration = 400, showText, onClick, onThemeChange, ...props },
    ref
  ) => {
    const { t } = useTranslation('shared');
    const [isDark, setIsDark] = useState(true);
    const innerRef = useRef<HTMLButtonElement>(null);

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      const updateTheme = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
      };

      updateTheme();

      const observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      return () => observer.disconnect();
    }, []);

    const toggleTheme = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);

        const button = innerRef.current;
        if (!button) return;

        const { top, left, width, height } = button.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const viewportWidth = window.visualViewport?.width ?? window.innerWidth;

        const viewportHeight =
          window.visualViewport?.height ?? window.innerHeight;

        const maxRadius = Math.hypot(
          Math.max(x, viewportWidth - x),
          Math.max(y, viewportHeight - y)
        );

        const applyTheme = () => {
          const newTheme = !isDark;

          const theme = newTheme
            ? EAppThemePreference.Dark
            : EAppThemePreference.Light;

          setIsDark(newTheme);
          document.documentElement.classList.toggle('dark');
          storageService.set({ theme });
          onThemeChange?.(theme);
        };

        if (typeof document.startViewTransition !== 'function') {
          applyTheme();

          return;
        }

        const transition = document.startViewTransition(() => {
          flushSync(applyTheme);
        });

        const ready = transition?.ready;
        if (ready && typeof ready.then === 'function') {
          ready.then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
              }
            );
          });
        }
      },
      [isDark, duration, onClick, onThemeChange]
    );

    const switch_to_light_mode_action = t('switch_to_light_mode_action');
    const switch_to_dark_mode_action = t('switch_to_dark_mode_action');
    const toggle_theme_aria_label = t('toggle_theme_aria_label');

    return (
      <button
        type="button"
        ref={setRefs}
        onClick={toggleTheme}
        className={cn(className)}
        {...props}
      >
        {isDark ? <Sun /> : <Moon />}
        {showText && (
          <span>
            {isDark ? switch_to_light_mode_action : switch_to_dark_mode_action}
          </span>
        )}
        <span className="sr-only">{toggle_theme_aria_label}</span>
      </button>
    );
  }
);

AnimatedThemeToggler.displayName = 'AnimatedThemeToggler';

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import SvgIcon from '@mui/material/SvgIcon';
import type { LeftNavProps, LeftNavItem } from './types';
import {
  StyledDrawer,
  NavContainer,
  NavContent,
  NavItemButton,
  StyledCollapse,
  FlyoutPaper,
  IconContainer,
  LabelContainer,
  BadgeContainer,
  ItemDivider,
  ToggleButtonContainer,
  EXPANDED_WIDTH,
  COLLAPSED_WIDTH,
} from './LeftNav.styled';

// Simple inline icons to avoid external dependencies
const ExpandMoreIcon = () => (
  <SvgIcon>
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </SvgIcon>
);

const ChevronRightIcon = () => (
  <SvgIcon>
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </SvgIcon>
);

const MenuIcon = () => (
  <SvgIcon>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </SvgIcon>
);

/**
 * LeftNav - Framework-agnostic sidebar navigation component.
 *
 * Supports:
 * - Desktop: permanent drawer with animated width (expanded/collapsed)
 * - Mobile: temporary drawer (overlay) below configurable breakpoint
 * - Expanded mode: inline collapses
 * - Collapsed mode: click-based Popper flyout for collapsible items
 * - Active state: pill background
 * - Sizes: sm | md | lg
 * - Slots: header, footer
 * - Controlled + uncontrolled state for drawer open and expanded collapses
 *
 * Router-agnostic: integrator provides renderLink callback.
 * No DashFormContext, no DashFormBridge (plain UI component only).
 */
export function LeftNav({
  items,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  expandedIds: controlledExpandedIds,
  defaultExpandedIds = [],
  onExpandedIdsChange,
  renderLink,
  isActive,
  size = 'md',
  widthExpanded = EXPANDED_WIDTH,
  widthCollapsed = COLLAPSED_WIDTH,
  mobileBreakpoint = 'md',
  mobileVariant = 'temporary',
  closeOnNavigateMobile = true,
  header,
  footer,
  className,
  'data-testid': dataTestId,
}: LeftNavProps): ReactNode {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));

  // Controlled vs uncontrolled open state
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [controlledOpen, onOpenChange]
  );

  // Controlled vs uncontrolled expanded state
  const [internalExpandedIds, setInternalExpandedIds] =
    useState<string[]>(defaultExpandedIds);
  const expandedIds =
    controlledExpandedIds !== undefined
      ? controlledExpandedIds
      : internalExpandedIds;

  const handleExpandedIdsChange = useCallback(
    (newExpandedIds: string[]) => {
      if (controlledExpandedIds === undefined) {
        setInternalExpandedIds(newExpandedIds);
      }
      onExpandedIdsChange?.(newExpandedIds);
    },
    [controlledExpandedIds, onExpandedIdsChange]
  );

  // Flyout state (for collapsed mode)
  const [activeFlyoutId, setActiveFlyoutId] = useState<string | null>(null);
  const anchorRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleToggleCollapse = useCallback(
    (itemId: string) => {
      if (isOpen) {
        // Expanded mode: toggle inline collapse
        const newExpandedIds = expandedIds.includes(itemId)
          ? expandedIds.filter((id) => id !== itemId)
          : [...expandedIds, itemId];
        handleExpandedIdsChange(newExpandedIds);
      } else {
        // Collapsed mode: toggle flyout
        setActiveFlyoutId((prev) => (prev === itemId ? null : itemId));
      }
    },
    [isOpen, expandedIds, handleExpandedIdsChange]
  );

  const handleCloseFlyout = useCallback(() => {
    setActiveFlyoutId(null);
  }, []);

  const handleLeafClick = useCallback(() => {
    if (isMobile && closeOnNavigateMobile) {
      handleOpenChange(false);
    }
  }, [isMobile, closeOnNavigateMobile, handleOpenChange]);

  // Close flyout on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeFlyoutId) {
        handleCloseFlyout();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeFlyoutId, handleCloseFlyout]);

  const renderNavItem = useCallback(
    (
      item: LeftNavItem,
      isNested = false,
      forceShowLabel = false
    ): ReactNode => {
      const showLabel = isOpen || forceShowLabel;
      const isItemActive = isActive?.(item) ?? false;
      const hasChildren = item.children && item.children.length > 0;

      if (item.type === 'group') {
        // Group header (non-interactive)
        return (
          <div key={item.id}>
            {item.dividerBefore && <ItemDivider />}
            <NavItemButton
              size={size}
              isActive={false}
              disabled
              data-dash-size={size}
              role="presentation"
            >
              {item.icon && <IconContainer>{item.icon}</IconContainer>}
              {showLabel && <LabelContainer>{item.label}</LabelContainer>}
            </NavItemButton>
            {isOpen && hasChildren && (
              <List disablePadding>
                {item.children!.map((child) => renderNavItem(child, true))}
              </List>
            )}
          </div>
        );
      }

      if (item.type === 'collapse') {
        const isExpanded = expandedIds.includes(item.id);
        const isFlyoutOpen = activeFlyoutId === item.id;

        return (
          <div key={item.id}>
            {item.dividerBefore && <ItemDivider />}
            <div
              ref={(el: HTMLDivElement | null) => {
                anchorRefs.current[item.id] = el;
              }}
            >
              <NavItemButton
                size={size}
                isActive={false}
                isNested={isNested}
                disabled={item.disabled}
                onClick={
                  isOpen
                    ? () => !item.disabled && handleToggleCollapse(item.id)
                    : undefined
                }
                onMouseDown={
                  !isOpen
                    ? (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!item.disabled) {
                          handleToggleCollapse(item.id);
                        }
                      }
                    : undefined
                }
                data-dash-size={size}
                role="button"
                aria-expanded={isOpen ? isExpanded : isFlyoutOpen}
                aria-label={
                  typeof item.label === 'string' ? item.label : undefined
                }
              >
                {item.icon && <IconContainer>{item.icon}</IconContainer>}
                {showLabel && <LabelContainer>{item.label}</LabelContainer>}
                {item.badge && showLabel && (
                  <BadgeContainer>{item.badge}</BadgeContainer>
                )}
                {isOpen &&
                  (isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />)}
              </NavItemButton>
            </div>

            {/* Expanded mode: inline collapse */}
            {isOpen && hasChildren && (
              <StyledCollapse in={isExpanded} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {item.children!.map((child) => renderNavItem(child, true))}
                </List>
              </StyledCollapse>
            )}

            {/* Collapsed mode: flyout popper */}
            {!isOpen &&
              isFlyoutOpen &&
              hasChildren &&
              anchorRefs.current[item.id] && (
                <Popper
                  open={isFlyoutOpen}
                  anchorEl={anchorRefs.current[item.id]}
                  placement="right-start"
                  disablePortal={false}
                  modifiers={[
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8],
                      },
                    },
                  ]}
                >
                  <ClickAwayListener onClickAway={handleCloseFlyout}>
                    <FlyoutPaper size={size} elevation={8}>
                      <List disablePadding>
                        {item.children!.map((child) =>
                          renderNavItem(child, false, true)
                        )}
                      </List>
                    </FlyoutPaper>
                  </ClickAwayListener>
                </Popper>
              )}
          </div>
        );
      }

      // type === 'item'
      const content = (
        <>
          {item.icon && <IconContainer>{item.icon}</IconContainer>}
          {showLabel && <LabelContainer>{item.label}</LabelContainer>}
          {item.badge && showLabel && (
            <BadgeContainer>{item.badge}</BadgeContainer>
          )}
        </>
      );

      const buttonProps = {
        size,
        isActive: isItemActive,
        isNested,
        disabled: item.disabled,
        'data-dash-size': size,
        'data-dash-active': String(isItemActive),
        role: 'menuitem',
        'aria-label': typeof item.label === 'string' ? item.label : undefined,
        ...(isItemActive && { 'aria-current': 'page' as const }),
      };

      return (
        <div key={item.id} onClick={handleLeafClick}>
          {item.dividerBefore && <ItemDivider />}
          {renderLink ? (
            <NavItemButton {...buttonProps}>
              {renderLink(item, content)}
            </NavItemButton>
          ) : (
            <NavItemButton {...buttonProps}>{content}</NavItemButton>
          )}
        </div>
      );
    },
    [
      size,
      isOpen,
      isActive,
      expandedIds,
      activeFlyoutId,
      renderLink,
      handleToggleCollapse,
      handleCloseFlyout,
      handleLeafClick,
    ]
  );

  const navContent = useMemo(
    () => (
      <NavContainer data-dash-open={String(isOpen)}>
        {header && <div>{header}</div>}
        <NavContent>
          <List disablePadding>{items.map((item) => renderNavItem(item))}</List>
        </NavContent>
        {footer && <div>{footer}</div>}
        <ToggleButtonContainer>
          <IconButton
            onClick={() => handleOpenChange(!isOpen)}
            size="small"
            data-testid="LeftNav.Toggle"
            aria-label={isOpen ? 'Collapse navigation' : 'Expand navigation'}
          >
            <MenuIcon />
          </IconButton>
        </ToggleButtonContainer>
      </NavContainer>
    ),
    [isOpen, header, footer, items, renderNavItem, handleOpenChange]
  );

  const effectiveMobileVariant =
    isMobile && mobileVariant === 'temporary' ? 'temporary' : 'permanent';

  return (
    <StyledDrawer
      variant={effectiveMobileVariant}
      open={effectiveMobileVariant === 'temporary' ? isOpen : true}
      onClose={() => handleOpenChange(false)}
      isOpen={isOpen}
      isMobile={isMobile}
      mobileVariant={mobileVariant}
      expandedWidth={widthExpanded}
      collapsedWidth={widthCollapsed}
      className={className}
      data-testid={dataTestId}
      data-dash-expanded-width={String(widthExpanded)}
      data-dash-collapsed-width={String(widthCollapsed)}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      PaperProps={{
        role: 'navigation',
        'aria-label': 'Main navigation',
        'data-dash-open': String(isOpen),
      }}
    >
      {navContent}
    </StyledDrawer>
  );
}

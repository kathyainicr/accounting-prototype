import { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import {
  Dropdown,
  DropdownOverlay,
  SelectInput,
  ActionList,
  ActionListItem,
  ActionListItemIcon,
  RayIcon,
  ChevronDownIcon,
} from '@razorpay/blade/components'
import { useThemeContext } from '../context/ThemeContext'

export type LedgerDropdownVariant = 'empty' | 'ai' | 'manual' | 'ai-approved'

type Props = {
  variant: LedgerDropdownVariant
  value?: string
  options: string[]
  onChange: (value: string) => void
  aiSuggestedValue?: string
  isDrawer?: boolean
  label?: string
  necessityIndicator?: 'required' | 'optional'
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const gradientFlow = keyframes`
  from { background-position: 0% center; }
  to   { background-position: 200% center; }
`

const AiTrigger = styled.button<{ $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid ${p => p.$isDark ? 'hsla(214, 20%, 84%, 0.18)' : 'hsla(211, 20%, 52%, 0.18)'};
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease;

  &:hover {
    border-color: ${p => p.$isDark ? 'hsla(214, 20%, 84%, 0.30)' : 'hsla(211, 20%, 52%, 0.30)'};
    background: ${p => p.$isDark ? 'hsla(214, 20%, 84%, 0.12)' : 'hsla(211, 20%, 52%, 0.12)'};
  }

  &:focus-visible {
    outline: 2px solid #48d08c;
    outline-offset: 2px;
  }
`

const SpinningRay = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  animation: ${spin} 2s linear infinite;
`

const GradientText = styled.span<{ $isDark: boolean }>`
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${p => p.$isDark ? `linear-gradient(90deg, #E6E9EF 25%, #8D9BB0 40%, #E6E9EF 75%)` : `linear-gradient(90deg, #40566D 25%, #768EA7 40%, #40566D 75%)`};
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientFlow} 3s linear infinite;
`

const PlainText = styled.span<{ $isDark: boolean }>`
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  color: ${p => p.$isDark ? '#FCFCFD' : '#000000'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MenuContainer = styled.div<{ $isDark: boolean }>`
  position: fixed;
  z-index: 9999;
  background: ${p => p.$isDark ? 'hsla(217, 27%, 15%, 1)' : 'hsla(0, 0%, 100%, 1)'};
  border: 1px solid ${p => p.$isDark ? 'hsla(214, 20%, 84%, 0.18)' : 'hsla(211, 20%, 52%, 0.18)'};
  border-radius: 4px;
  box-shadow: 0px 8px 24px 0px hsla(217, 56%, 17%, 0.12);
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
`

const MenuItem = styled.button<{ $isSelected?: boolean; $isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 16px);
  margin: 0 8px;
  padding: 8px;
  border-radius: 4px;
  text-align: left;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: ${p => p.$isDark ? 'hsla(240, 20%, 99%, 1)' : 'hsla(212, 39%, 16%, 1)'};
  background: ${p => p.$isSelected
    ? (p.$isDark ? 'hsla(227, 100%, 59%, 0.24)' : 'hsla(227, 100%, 59%, 0.09)')
    : 'transparent'};
  border: none;
  cursor: pointer;
  transition: background 100ms ease;

  &:hover {
    background: ${p => p.$isSelected
      ? (p.$isDark ? 'hsla(227, 100%, 59%, 0.32)' : 'hsla(227, 100%, 59%, 0.18)')
      : (p.$isDark ? 'hsla(214, 20%, 84%, 0.12)' : 'hsla(211, 20%, 52%, 0.12)')};
    color: ${p => p.$isDark ? 'hsla(240, 20%, 99%, 1)' : 'hsla(212, 39%, 16%, 1)'};
  }
`

const ESTIMATED_MENU_HEIGHT = 300

export const LedgerDropdown = ({ variant, value = '', options, onChange, aiSuggestedValue, isDrawer, label, necessityIndicator }: Props) => {
  const { colorScheme } = useThemeContext()
  const isDark = colorScheme === 'dark'

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const close = () => setIsMenuOpen(false)
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isMenuOpen])

  const handleTriggerClick = () => {
    if (!isMenuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom - 8
      const openAbove = spaceBelow < ESTIMATED_MENU_HEIGHT
      setMenuPos({
        top: openAbove ? rect.top - ESTIMATED_MENU_HEIGHT - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    setIsMenuOpen((o) => !o)
  }

  const customMenu = isMenuOpen && menuPos && (
    <MenuContainer $isDark={isDark} style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}>
      {options.map((opt) => (
        <MenuItem
          key={opt}
          type="button"
          $isSelected={opt === value}
          $isDark={isDark}
          onClick={() => { onChange(opt); setIsMenuOpen(false) }}
        >
          {opt === aiSuggestedValue && (
            <RayIcon size="medium" color="feedback.icon.positive.intense" />
          )}
          <span>{opt}</span>
        </MenuItem>
      ))}
    </MenuContainer>
  )

  if (isDrawer) {
    return (
      <Dropdown selectionType="single">
        <SelectInput
          label={label ?? ''}
          placeholder="Select ledger"
          value={value || undefined}
          icon={variant === 'ai' || variant === 'ai-approved' ? RayIcon : undefined}
          necessityIndicator={necessityIndicator}
          onChange={({ values }) => onChange(values[0] ?? '')}
        />
        <DropdownOverlay>
          <ActionList>
            {options.map((opt) => (
              <ActionListItem
                key={opt}
                title={opt}
                value={opt}
                leading={opt === aiSuggestedValue ? <ActionListItemIcon icon={RayIcon} /> : undefined}
              />
            ))}
          </ActionList>
        </DropdownOverlay>
      </Dropdown>
    )
  }

  if (variant === 'ai') {
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <AiTrigger $isDark={isDark} ref={triggerRef} type="button" onClick={handleTriggerClick}>
          <SpinningRay>
            <RayIcon size="medium" color="feedback.icon.positive.intense" />
          </SpinningRay>
          <GradientText $isDark={isDark}>{value}</GradientText>
          <ChevronDownIcon size="medium" color="surface.icon.gray.muted" />
        </AiTrigger>
        {customMenu}
      </div>
    )
  }

  if ((variant === 'manual' || variant === 'ai-approved') && aiSuggestedValue) {
    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <AiTrigger $isDark={isDark} ref={triggerRef} type="button" onClick={handleTriggerClick}>
          {variant === 'ai-approved' && (
            <SpinningRay>
              <RayIcon size="medium" color="feedback.icon.positive.intense" />
            </SpinningRay>
          )}
          <PlainText $isDark={isDark}>{value}</PlainText>
          <ChevronDownIcon size="medium" color="surface.icon.gray.muted" />
        </AiTrigger>
        {customMenu}
      </div>
    )
  }

  return (
    <Dropdown selectionType="single">
      <SelectInput
        label=""
        placeholder="Select ledger"
        value={value || undefined}
        onChange={({ values }) => onChange(values[0] ?? '')}
      />
      <DropdownOverlay>
        <ActionList>
          {options.map((opt) => (
            <ActionListItem key={opt} title={opt} value={opt} />
          ))}
        </ActionList>
      </DropdownOverlay>
    </Dropdown>
  )
}

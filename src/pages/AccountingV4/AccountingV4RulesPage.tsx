import { useState } from 'react'
import styled from 'styled-components'
import {
  Box,
  Text,
  Button,
  Badge,
  Switch,
  Divider,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownOverlay,
  ActionList,
  ActionListItem,
  SelectInput,
} from '@razorpay/blade/components'
import { useAccountingV4 } from '../../context/AccountingV4Context'
import { PAYOUT_PURPOSES, CONTACT_TYPES } from './data'
import type { V4Rule, V4RuleType } from './types'

// ─── Styled ────────────────────────────────────────────────────────────────────

const RuleCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  gap: 16px;
  &:hover { border-color: rgba(255,255,255,0.12); }
`

const DeleteBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  font-family: inherit;
  &:hover { background: rgba(239,68,68,0.12); color: #ef4444; }
`

const RuleTypeTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${({ $active }) => $active ? 'rgba(0,208,132,0.5)' : 'rgba(255,255,255,0.1)'};
  border-radius: 8px;
  background: ${({ $active }) => $active ? 'rgba(0,208,132,0.1)' : 'transparent'};
  color: ${({ $active }) => $active ? '#00d084' : 'rgba(255,255,255,0.5)'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 150ms ease;
  text-align: center;
  &:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
`

const ArrowGlyph = styled.span`
  font-size: 16px;
  color: rgba(255,255,255,0.3);
  flex-shrink: 0;
`

// ─── Icons ─────────────────────────────────────────────────────────────────────

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

const RaySparkIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.5 9.5L2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
  </svg>
)

// ─── LEDGER OPTIONS ───────────────────────────────────────────────────────────

const LEDGER_OPTIONS = [
  'Sundry Creditors',
  'Salary Payable A/C',
  'Payout Expense A/C',
  'Tech Services A/C',
  'Tax Payable A/C',
  'Operations Expense A/C',
  'Vendor Advances A/C',
]

// ─── Rule row ─────────────────────────────────────────────────────────────────

function RuleRow({ rule }: { rule: V4Rule }) {
  const { toggleRule, deleteRule } = useAccountingV4()

  return (
    <RuleCard>
      <Box display="flex" alignItems="center" gap="spacing.3" flex="1">
        {/* Type badge */}
        <Badge
          color={rule.createdBy === 'ray' ? 'information' : 'neutral'}
          size="small"
        >
          {rule.createdBy === 'ray' && <RaySparkIcon />}{' '}
          {rule.type === 'compound'     ? 'Compound'
           : rule.type === 'purpose-only' ? 'Purpose'
           : 'Contact'}
        </Badge>

        {/* Condition pills */}
        <Box display="flex" alignItems="center" gap="spacing.2" flexWrap="wrap" flex="1">
          {rule.payoutPurpose && (
            <Badge color="notice" size="small">Purpose: {rule.payoutPurpose}</Badge>
          )}
          {rule.contactType && (
            <Badge color="primary" size="small">Contact: {rule.contactType}</Badge>
          )}
          <ArrowGlyph>→</ArrowGlyph>
          <Text size="small" weight="semibold" color="surface.text.gray.normal">
            {rule.ledger}
          </Text>
        </Box>
      </Box>

      {/* Actions */}
      <Box display="flex" alignItems="center" gap="spacing.3">
        <Switch
          size="small"
          isChecked={rule.isActive}
          onChange={() => toggleRule(rule.id)}
          accessibilityLabel={`Toggle rule ${rule.id}`}
        />
        <DeleteBtn onClick={() => deleteRule(rule.id)} title="Delete rule">
          <TrashIcon />
        </DeleteBtn>
      </Box>
    </RuleCard>
  )
}

// ─── Add rule modal ────────────────────────────────────────────────────────────

type AddRuleFormState = {
  type: V4RuleType
  payoutPurpose: string
  contactType: string
  ledger: string
}

function AddRuleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addRule } = useAccountingV4()

  const [form, setForm] = useState<AddRuleFormState>({
    type: 'purpose-only',
    payoutPurpose: '',
    contactType: '',
    ledger: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AddRuleFormState, string>>>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!form.ledger) e.ledger = 'Please select a ledger'
    if ((form.type === 'purpose-only' || form.type === 'compound') && !form.payoutPurpose) {
      e.payoutPurpose = 'Please select a payout purpose'
    }
    if ((form.type === 'contact-only' || form.type === 'compound') && !form.contactType) {
      e.contactType = 'Please select a contact type'
    }
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }

    addRule({
      type: form.type,
      payoutPurpose: form.payoutPurpose || undefined,
      contactType: form.contactType || undefined,
      ledger: form.ledger,
      isActive: true,
      createdBy: 'manual',
    })

    setForm({ type: 'purpose-only', payoutPurpose: '', contactType: '', ledger: '' })
    setErrors({})
    onClose()
  }

  const handleClose = () => {
    setForm({ type: 'purpose-only', payoutPurpose: '', contactType: '', ledger: '' })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={handleClose} size="small">
      <ModalHeader title="Add Smart Rule" />

      <ModalBody>
        <Box display="flex" flexDirection="column" gap="spacing.6">
          {/* Rule type selector */}
          <Box>
            <Text size="small" weight="semibold" marginBottom="spacing.3">Rule type</Text>
            <Box display="flex" gap="spacing.2">
              {([
                { key: 'purpose-only' as V4RuleType, label: 'Purpose' },
                { key: 'contact-only' as V4RuleType, label: 'Contact type' },
                { key: 'compound' as V4RuleType, label: 'Purpose + Contact' },
              ]).map(({ key, label }) => (
                <RuleTypeTab
                  key={key}
                  $active={form.type === key}
                  onClick={() => setForm((f) => ({ ...f, type: key }))}
                >
                  {label}
                </RuleTypeTab>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Conditional fields */}
          {(form.type === 'purpose-only' || form.type === 'compound') && (
            <Dropdown>
              <SelectInput
                label="Payout purpose"
                placeholder="Select purpose"
                value={form.payoutPurpose || undefined}
                validationState={errors.payoutPurpose ? 'error' : 'none'}
                errorText={errors.payoutPurpose}
                onChange={({ values }) => {
                  setForm((f) => ({ ...f, payoutPurpose: values[0] ?? '' }))
                  setErrors((e) => ({ ...e, payoutPurpose: undefined }))
                }}
              />
              <DropdownOverlay>
                <ActionList>
                  {PAYOUT_PURPOSES.map((p) => (
                    <ActionListItem key={p} title={p} value={p} />
                  ))}
                </ActionList>
              </DropdownOverlay>
            </Dropdown>
          )}

          {(form.type === 'contact-only' || form.type === 'compound') && (
            <Dropdown>
              <SelectInput
                label="Contact type"
                placeholder="Select contact type"
                value={form.contactType || undefined}
                validationState={errors.contactType ? 'error' : 'none'}
                errorText={errors.contactType}
                onChange={({ values }) => {
                  setForm((f) => ({ ...f, contactType: values[0] ?? '' }))
                  setErrors((e) => ({ ...e, contactType: undefined }))
                }}
              />
              <DropdownOverlay>
                <ActionList>
                  {CONTACT_TYPES.map((c) => (
                    <ActionListItem key={c} title={c} value={c} />
                  ))}
                </ActionList>
              </DropdownOverlay>
            </Dropdown>
          )}

          <Dropdown>
            <SelectInput
              label="Map to ledger"
              placeholder="Select ledger"
              value={form.ledger || undefined}
              validationState={errors.ledger ? 'error' : 'none'}
              errorText={errors.ledger}
              onChange={({ values }) => {
                setForm((f) => ({ ...f, ledger: values[0] ?? '' }))
                setErrors((e) => ({ ...e, ledger: undefined }))
              }}
            />
            <DropdownOverlay>
              <ActionList>
                {LEDGER_OPTIONS.map((l) => (
                  <ActionListItem key={l} title={l} value={l} />
                ))}
              </ActionList>
            </DropdownOverlay>
          </Dropdown>
        </Box>
      </ModalBody>

      <ModalFooter>
        <Box display="flex" gap="spacing.3" justifyContent="flex-end">
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save rule</Button>
        </Box>
      </ModalFooter>
    </Modal>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

const SectionLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
`

function SectionHeading({ title, count }: { title: string; count: number }) {
  return (
    <Box display="flex" alignItems="center" gap="spacing.3">
      <SectionLabel>{title}</SectionLabel>
      <Text size="xsmall" color="surface.text.gray.disabled">({count})</Text>
    </Box>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AccountingV4RulesPage() {
  const { rules } = useAccountingV4()
  const [isAddOpen, setIsAddOpen] = useState(false)

  const rayRules    = rules.filter((r) => r.createdBy === 'ray')
  const purposeRules  = rules.filter((r) => r.createdBy === 'manual' && r.type === 'purpose-only')
  const contactRules  = rules.filter((r) => r.createdBy === 'manual' && r.type === 'contact-only')
  const compoundRules = rules.filter((r) => r.createdBy === 'manual' && r.type === 'compound')

  const renderSection = (title: string, sectionRules: V4Rule[]) =>
    sectionRules.length > 0 && (
      <Box display="flex" flexDirection="column" gap="spacing.3">
        <SectionHeading title={title} count={sectionRules.length} />
        {sectionRules.map((r) => <RuleRow key={r.id} rule={r} />)}
      </Box>
    )

  return (
    <Box paddingTop="spacing.6" paddingBottom="spacing.8" display="flex" flexDirection="column" gap="spacing.7">
      {/* Add rule action */}
      <Box display="flex" justifyContent="flex-end">
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          Add rule
        </Button>
      </Box>

      {/* Rule sections */}
      <Box display="flex" flexDirection="column" gap="spacing.7">
        {renderSection('Ray-created rules', rayRules)}
        {renderSection('Purpose rules', purposeRules)}
        {renderSection('Contact type rules', contactRules)}
        {renderSection('Compound rules', compoundRules)}

        {rules.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding="spacing.11"
            gap="spacing.3"
          >
            <Text color="surface.text.gray.muted">No rules yet.</Text>
            <Text size="small" color="surface.text.gray.disabled">
              Add a rule to automatically map payouts to Tally ledgers.
            </Text>
            <Button variant="secondary" size="small" onClick={() => setIsAddOpen(true)}>
              Add your first rule
            </Button>
          </Box>
        )}
      </Box>

      <AddRuleModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </Box>
  )
}

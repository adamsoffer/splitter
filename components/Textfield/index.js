import { Container, Label, Input } from './styles'

export default ({
  label,
  disabled,
  readonly,
  type,
  name,
  placeholder,
  value,
  step
}) => {
  return (
    <Container>
      <Label>{label}</Label>
      <Input
        disabled={disabled}
        name={name}
        placeholder={placeholder}
        readonly={readonly}
        step={step}
        type={type}
        value={value}
      />
    </Container>
  )
}

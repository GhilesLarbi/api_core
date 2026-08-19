import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import {
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@shared/ui/components/form'
import { Input } from '@shared/ui/components/input'
import { PasswordInput } from '@shared/ui/components/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select'
import { Textarea } from '@shared/ui/components/textarea'
import { useInFieldGroup } from '@shared/ui/hooks/use-in-field-group'
import { type fieldVariants } from '@shared/ui/lib/field-variants'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export type Option = { value: string; label: React.ReactNode }

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
type FieldProps<
  TValues extends FieldValues,
  TName extends FieldPath<TValues>,
> = VariantProps<typeof fieldVariants> & {
  name: TName
  label?: React.ReactNode
  description?: React.ReactNode
  placeholder?: string
  as?: 'input' | 'textarea' | 'password' | 'select' | 'custom'
  type?: React.HTMLInputTypeAttribute
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  options?: Option[]
  disabled?: boolean
  autoComplete?: string
  className?: string
  children?: (
    field: ControllerRenderProps<TValues, TName>
  ) => React.ReactElement
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function Field<
  TValues extends FieldValues,
  TName extends FieldPath<TValues> = FieldPath<TValues>,
>({
  name,
  label,
  description,
  placeholder,
  as = 'input',
  type,
  inputMode,
  options,
  disabled,
  autoComplete,
  className,
  variant,
  inputSize,
  children,
}: FieldProps<TValues, TName>) {
  const { control } = useFormContext<TValues>()
  const grouped = useInFieldGroup()
  const shape = variant ?? (grouped ? 'grouped' : 'filled')
  const height = inputSize ?? (grouped ? 'row' : 'lg')
  const inset = shape === 'grouped' ? 'px-4' : undefined

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel className={inset}>{label}</FormLabel>}
          <FormControl>
            {children ? (
              children(field)
            ) : as === 'textarea' ? (
              <Textarea
                variant={shape}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
              />
            ) : as === 'password' ? (
              <PasswordInput
                variant={shape}
                inputSize={height}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                {...field}
              />
            ) : as === 'select' ? (
              <SelectControl
                variant={shape}
                inputSize={height}
                placeholder={placeholder}
                disabled={disabled}
                options={options ?? []}
                value={field.value}
                onChange={field.onChange}
              />
            ) : (
              <Input
                variant={shape}
                inputSize={height}
                type={type}
                inputMode={inputMode}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                {...field}
              />
            )}
          </FormControl>
          {description && (
            <FormDescription className={inset}>{description}</FormDescription>
          )}
          <FormMessage className={inset} />
        </FormItem>
      )}
    />
  )
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function SelectControl({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  variant,
  inputSize,
}: VariantProps<typeof fieldVariants> & {
  value: string | undefined
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger variant={variant} inputSize={inputSize}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

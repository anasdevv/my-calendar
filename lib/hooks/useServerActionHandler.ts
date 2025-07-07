import { useForm, FieldPath } from 'react-hook-form';
import { ActionResult } from '@/lib/types/action-result';

/**
 * Hook to handle server action results with form error integration
 */
export function useServerActionHandler<T extends Record<string, any>>(
  form: ReturnType<typeof useForm<T>>
) {
  const handleServerActionResult = (result: ActionResult) => {
    if (!result.success) {
      // Handle field-specific errors
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, errors]) => {
          if (errors && errors.length > 0) {
            // Type assertion to ensure the field exists in the form schema
            form.setError(field as FieldPath<T>, {
              message: errors[0], // Show first error for each field
            });
          }
        });
      } else {
        // Handle general errors
        form.setError('root', {
          message: result.error,
        });
      }
      return false;
    }
    return true;
  };

  const clearFormErrors = () => {
    form.clearErrors();
  };

  return {
    handleServerActionResult,
    clearFormErrors,
  };
}

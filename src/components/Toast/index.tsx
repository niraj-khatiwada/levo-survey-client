import { Toaster as NativeToaster, toast } from 'sonner'

export function Toaster() {
  return (
    <NativeToaster
      position="bottom-center"
      richColors
      theme="light"
      toastOptions={{
        classNames: {
          default:
            'w-fit rounded-[3rem] px-4 py-2 flex justify-center align-center',
        },
        duration: 2500,
      }}
      className="flex justify-center items-center"
    />
  )
}

export { toast }

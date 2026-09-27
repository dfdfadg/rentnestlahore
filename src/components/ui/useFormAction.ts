"use client";

import { useActionState, useTransition } from "react";

/**
 * Like useActionState, but returns an onSubmit handler instead of a form action.
 * React 19 resets uncontrolled forms after a <form action> submission, which wipes
 * everything the user typed when the server returns a validation error. Dispatching the
 * action manually keeps the entered values in place.
 */
export function useFormAction<S>(action: (state: Awaited<S>, formData: FormData) => S | Promise<S>, initialState: Awaited<S>) {
  const [state, dispatch, pending] = useActionState(action, initialState);
  const [transitionPending, startTransition] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(fd));
  };
  return [state, onSubmit, pending || transitionPending] as const;
}

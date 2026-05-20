import React, { useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from "sonner";

export default function Form() {
  const formRef = useRef(null);
  const textareaRef = useRef(null);

  const formSchema = useMemo(
    () =>
      z.object({
        username: z.string().min(2, "Please enter a valid name"),
        email: z.string().email("Please enter a valid email"),
        phone: z.string().min(5, "Please enter a valid phone number"),
        message: z.string().min(10, "The message must be at least 10 characters long"),
      }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "", phone: "", message: "" },
    mode: "onSubmit",
  });

  const messageValue = watch("message");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 24 * 4;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [messageValue]);

  const onSubmit = async () => {
    if (!formRef.current) return;
    try {
      await emailjs.sendForm(
        import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
        import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY }
      );
      toast.success("Message sent", { description: "We'll get back to you shortly." });
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Error", { description: "Something went wrong, please try again." });
    }
  };

  const { ref: registerRef, ...registerProps } = register("message");

  const fieldClass =
    "w-full bg-transparent border-b border-white/20 text-white placeholder:text-white/40 pb-2 outline-none text-[0.9rem] tracking-widest font-light";
  const labelClass = "block text-white/40 text-[0.7rem] tracking-widest mb-1 uppercase";
  const errorClass = "text-red-400 text-xs mt-1";

  return (
    <>
      <Toaster theme="dark" position="bottom-right" />
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-8"
      >
        <div>
          <label className={labelClass}>Name</label>
          <input
            {...register("username")}
            name="username"
            placeholder="ALEX CARTER"
            className={fieldClass}
          />
          {errors.username && <p className={errorClass}>{errors.username.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            {...register("phone")}
            name="phone"
            type="tel"
            placeholder="+1 234 567 8910"
            className={fieldClass}
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            {...register("email")}
            name="email"
            type="email"
            placeholder="hello@borsoga.com"
            className={fieldClass}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Project Notes</label>
          <textarea
            {...registerProps}
            name="message"
            ref={(e) => {
              registerRef(e);
              textareaRef.current = e;
            }}
            placeholder="Tell about the space, the brief..."
            rows={1}
            className={`${fieldClass} resize-none leading-6 italic`}
            style={{ minHeight: "28px" }}
          />
          {errors.message && <p className={errorClass}>{errors.message.message}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="footer__send-btn inline-flex items-center gap-3 bg-white text-black text-[0.75rem] tracking-widest font-light py-4 px-7 rounded-full cursor-pointer transition-opacity duration-200 hover:opacity-80 disabled:opacity-40 whitespace-nowrap"
          >
            {isSubmitting ? "SENDING..." : "SEND TRANSMISSION"}
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.75 14.25L14.25 3.75M14.25 3.75H6.75M14.25 3.75V11.25" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}

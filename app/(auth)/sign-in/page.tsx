'use client';
import React from 'react';
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import {useRouter} from "next/navigation";

const SignIn = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur'
    }, );
    const onSubmit = async (data: SignInFormData) => {
        try {

        } catch (e) {

        }
    }
  return (
           <>
               <h1 className="form-title">Log In Your Account</h1>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                   <InputField
                       name="email"
                       label="Email"
                       placeholder="Enter your email"
                       register={register}
                       error={errors.email}
                       validation={{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/, message: 'Email address is required'}}
                   />

                   <InputField
                       name="password"
                       label="Password"
                       placeholder="Enter your password"
                       register={register}
                       error={errors.password}
                       validation={{ required: 'Password is required', minLength: 8}}
                   />
                   <Button type="submit" disabled={isSubmitting} className="yellow-btn w-full mt-5">
                       {isSubmitting ? 'Signing in' : 'Log In'}
                   </Button>
                   <FooterLink text="Don't have an account?" linkText="Sign Up" href="/sign-up" />

               </form>
           </>
       )

}

export default SignIn;
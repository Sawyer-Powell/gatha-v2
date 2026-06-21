<script lang="ts">
    import Logo from "$lib/design-system/Logo.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import HStack from "$lib/design-system/HStack.svelte";
    import Card from "$lib/design-system/Card.svelte";
    import Input from "$lib/design-system/Input.svelte";
    import Button from "$lib/design-system/Button.svelte";
    import Spacer from "$lib/design-system/Spacer.svelte";
    import Link from "$lib/design-system/typography/Link.svelte";
    import ScrollingText from "$lib/pages/auth/ScrollingText.svelte";
    import { EnvelopeIcon, LockIcon } from "phosphor-svelte";
    import { dispatch, getStore } from "$lib/store.svelte";
    import { signInContent, signInError, signInPage } from "./auth.css";

    const store = $derived(getStore());
    const page = $derived(
        typeof store.session.page === "object" && "SignIn" in store.session.page
            ? store.session.page.SignIn
            : null,
    );
    const errorMessage = $derived.by(() => {
        const status = page?.status;
        if (typeof status === "object" && status !== null && "ValidationError" in status) {
            return status.ValidationError.message;
        }
        if (status === "InvalidCredentials") {
            return "Invalid email or password";
        }
        return null;
    });
    const loading = $derived(page?.status === "Loading");

    function handleSignIn() {
        dispatch({ Session: "SignIn" });
    }

    function handleRegister() {
        dispatch({ Session: "Register" });
    }

    function updateEmail(value: string) {
        dispatch({ Session: { Auth: { UpdateEmail: value } } });
    }

    function updatePassword(value: string) {
        dispatch({ Session: { Auth: { UpdatePassword: value } } });
    }
</script>

<div class={signInPage}>
    <ScrollingText />

    <div class={signInContent}>
        <VStack gap="md" align="center">
            <Spacer size="xl" />
            <Logo />
            <Spacer size="sm" />
            <Card padding="lg">
		    <form onsubmit={(ev) => { ev.preventDefault(); handleSignIn();}}>
			<VStack gap="md">
			    <Input
                id="sign-in-email"
                name="email"
				placeholder="Email"
				type="email"
                autocomplete="email"
				icon={EnvelopeIcon}
				value={page?.email ?? ""}
                ariaLabel="Email"
                ariaInvalid={Boolean(errorMessage)}
                ariaDescribedby={errorMessage ? "sign-in-error" : undefined}
				oninput={updateEmail}
			    />
			    <VStack gap="xs">
				<HStack justify="end">
				    <Link href="#/forgot-password" size="xs"
					>Forgot password?</Link
				    >
				</HStack>
				<Input
                    id="sign-in-password"
                    name="password"
				    placeholder="Password"
				    type="password"
                    autocomplete="current-password"
				    icon={LockIcon}
				    value={page?.password ?? ""}
                    ariaLabel="Password"
                    ariaInvalid={Boolean(errorMessage)}
                    ariaDescribedby={errorMessage ? "sign-in-error" : undefined}
				    oninput={updatePassword}
				/>
				{#if errorMessage}
				    <p id="sign-in-error" class={signInError} role="alert">{errorMessage}</p>
				{/if}
			    </VStack>
			    <Spacer size="xs" />
			    <HStack gap="sm" justify="center">
				<Button type="submit" loading={loading}
				    >Sign in</Button
				>
				<Button
                    type="button"
				    variant="ghost"
				    loading={loading}
				    onclick={handleRegister}>Register</Button
				>
			    </HStack>
			</VStack>
		</form>
            </Card>
        </VStack>
    </div>
</div>

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

<div class="page">
    <ScrollingText />

    <div class="content">
        <VStack gap="md" align="center">
            <Spacer size="xl" />
            <Logo />
            <Spacer size="sm" />
            <Card padding="lg">
		    <form onsubmit={(ev) => { ev.preventDefault(); handleSignIn();}}>
			<VStack gap="md">
			    <Input
				placeholder="Email"
				type="email"
				icon={EnvelopeIcon}
				value={page?.email ?? ""}
				oninput={updateEmail}
			    />
			    <VStack gap="xs">
				<HStack justify="end">
				    <Link href="#/forgot-password" size="xs"
					>Forgot password?</Link
				    >
				</HStack>
				<Input
				    placeholder="Password"
				    type="password"
				    icon={LockIcon}
				    value={page?.password ?? ""}
				    oninput={updatePassword}
				/>
				{#if errorMessage}
				    <p class="error">{errorMessage}</p>
				{/if}
			    </VStack>
			    <Spacer size="xs" />
			    <HStack gap="sm" justify="center">
				<Button loading={page?.status === "Loading"} onclick={handleSignIn}
				    >Sign in</Button
				>
				<Button
				    variant="ghost"
				    loading={page?.status === "Loading"}
				    onclick={handleRegister}>Register</Button
				>
			    </HStack>
			</VStack>
		</form>
            </Card>
        </VStack>
    </div>
</div>

<style>
    .page {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
    }

    .content {
        position: relative;
        z-index: 1;
    }

    .error {
        color: var(--color-error, #e53e3e);
        font-size: 0.8rem;
        margin: 0.25rem 0 0 0;
    }
</style>

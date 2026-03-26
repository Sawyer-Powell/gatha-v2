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

    let email = $state("");
    let password = $state("");
    let signingIn = $state(false);
    let registering = $state(false);

    function handleSignIn() {
        signingIn = true;
    }

    function handleRegister() {
        registering = true;
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
                <VStack gap="md">
                    <Input
                        placeholder="Email"
                        type="email"
                        icon={EnvelopeIcon}
                        value={email}
                        oninput={(v) => (email = v)}
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
                            value={password}
                            oninput={(v) => (password = v)}
                        />
                    </VStack>
                    <Spacer size="sm" />
                    <HStack gap="sm" justify="center">
                        <Button loading={signingIn} onclick={handleSignIn}
                            >Sign in</Button
                        >
                        <Button
                            variant="ghost"
                            loading={registering}
                            onclick={handleRegister}>Register</Button
                        >
                    </HStack>
                </VStack>
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
</style>

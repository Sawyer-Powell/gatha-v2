<script lang="ts">
    import type { Snippet } from "svelte";
    import { tick } from "svelte";
    import { modalBackdrop, modalContent } from "./design-system.css";
    let {
        open = false,
        classname = "",
        ariaLabel = "Dialog",
        ariaLabelledby = undefined,
        ariaDescribedby = undefined,
        onclose,
        children,
    }: {
        open: boolean;
        classname?: string;
        ariaLabel?: string;
        ariaLabelledby?: string;
        ariaDescribedby?: string;
        onclose?: () => void;
        children: Snippet;
    } = $props();

    let dialogEl = $state<HTMLDivElement>();
    let returnFocusEl: HTMLElement | null = null;

    const focusableSelector = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    function focusableElements() {
        return Array.from(dialogEl?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
            .filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
    }

    function focusInitialElement() {
        focusableElements()[0]?.focus();
        if (!dialogEl?.contains(document.activeElement)) dialogEl?.focus();
    }

    function trapFocus(event: KeyboardEvent) {
        if (event.key !== "Tab") return;
        const elements = focusableElements();
        if (!elements.length) {
            event.preventDefault();
            dialogEl?.focus();
            return;
        }
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    $effect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    });

    $effect(() => {
        if (!open) return;
        returnFocusEl = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        tick().then(focusInitialElement);
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onclose?.();
            } else {
                trapFocus(event);
            }
        };
        document.addEventListener("keydown", handleKeydown);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
            returnFocusEl?.focus();
            returnFocusEl = null;
        };
    });
</script>

<div
    class={modalBackdrop}
    data-open={open}
    role="presentation"
    onpointerdown={(event) => {
        if (event.target === event.currentTarget) onclose?.();
    }}
>
    <div
        bind:this={dialogEl}
        class="{modalContent} {classname}"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabelledby ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        tabindex="-1"
    >
        {@render children()}
    </div>
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import { scrollingText, scrollingTextRow } from "./auth.css";

    const charSet =
        "abcdefghijklmnopqrstuvwxyz0123456789 .,:;!?-—()[]{}\"'/@#$%&*";
    const lineHeightRem = 1.5 * 1.6;

    let containerEl: HTMLDivElement;

    type Row = {
        speed: number;
        startIndex: number;
        subpixel: number;
        el?: HTMLDivElement;
    };
    let rows = $state<Row[]>([]);

    onMount(() => {
        const measure = document.createElement("span");
        measure.style.fontFamily = '"JetBrains Mono", monospace';
        measure.style.fontSize = "1.5rem";
        measure.style.letterSpacing = "0.05em";
        measure.style.position = "absolute";
        measure.style.visibility = "hidden";
        measure.textContent = "X";
        document.body.appendChild(measure);
        const charWidth = measure.getBoundingClientRect().width;
        document.body.removeChild(measure);

        const bufferLen = 300;
        const buffer = new Uint8Array(bufferLen);
        for (let i = 0; i < bufferLen; i++) {
            buffer[i] = Math.floor(Math.random() * charSet.length);
        }

        let charsVisible = 0;

        function setup() {
            const h = containerEl.clientHeight;
            const w = containerEl.clientWidth;
            const rowPx = lineHeightRem * 16;
            const rowCount = Math.ceil(h / rowPx) + 1;
            charsVisible = Math.ceil(w / charWidth) + 2;

            while (rows.length < rowCount) {
                rows.push({
                    speed: 3 + Math.random() * 12,
                    startIndex: Math.floor(Math.random() * bufferLen),
                    subpixel: 0,
                });
            }
            rows.length = rowCount;
        }

        setup();
        window.addEventListener("resize", setup);

        function rowText(startIndex: number): string {
            let s = "";
            for (let j = 0; j < charsVisible; j++) {
                s += charSet[buffer[(startIndex + j) % bufferLen]];
            }
            return s;
        }

        requestAnimationFrame(() => {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (row.el) row.el.textContent = rowText(row.startIndex);
            }
        });

        let prev = performance.now();
        let frame: number;

        const tick = (now: number) => {
            const seconds = (now - prev) / 1000;
            prev = now;

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (!row.el) continue;
                row.subpixel += row.speed * seconds;
                row.el.style.transform = `translateX(${-row.subpixel}px)`;
            }

            frame = requestAnimationFrame(tick);
        };

        const textInterval = setInterval(() => {
            for (let m = 0; m < 8; m++) {
                buffer[Math.floor(Math.random() * bufferLen)] = Math.floor(
                    Math.random() * charSet.length,
                );
            }

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (!row.el) continue;

                if (row.subpixel >= charWidth) {
                    const stepped = Math.floor(row.subpixel / charWidth);
                    row.startIndex = (row.startIndex + stepped) % bufferLen;
                    row.subpixel -= stepped * charWidth;
                }

                row.el.textContent = rowText(row.startIndex);
            }
        }, 1000);

        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            clearInterval(textInterval);
            window.removeEventListener("resize", setup);
        };
    });
</script>

<div class={scrollingText} bind:this={containerEl}>
    {#each rows as row}
        <div class={scrollingTextRow} bind:this={row.el}></div>
    {/each}
</div>

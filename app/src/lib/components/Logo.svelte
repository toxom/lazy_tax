<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 28 }: Props = $props();
</script>

<!-- Sleeping coin: Lazy Tax mark. Uses currentColor so it follows the theme accent. -->
<svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
	<circle cx="14" cy="18" r="11" stroke="currentColor" stroke-width="2.5" />
	<path
		d="M9.5 13.5h9l-9 9h9"
		stroke="currentColor"
		stroke-width="2.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M23 3.5h5l-5 5.5h5"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

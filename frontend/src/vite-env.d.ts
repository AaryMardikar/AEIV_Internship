/// <reference types="vite/client" />

// ─── MUI Icons Material module declaration ────────────────────────────────────
declare module '@mui/icons-material' {
  export * from '@mui/icons-material/index';
}

declare module '@mui/icons-material/*' {
  import { SvgIconComponent } from '@mui/material';
  const Icon: SvgIconComponent;
  export default Icon;
}

interface AppFont {
  variable: string;
}

// Keep the existing layout contract without relying on a network font fetch
// during production builds. The actual stack is defined in globals.css.
export const inter: AppFont = {
  variable: "",
};

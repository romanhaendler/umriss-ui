import { Component } from "react";
import type { ReactNode } from "react";

/** Keeps a widget whose content throws from taking the dashboard with it: the
    frame stays and `fallback` stands in the body. */
export class Failed extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

import { Component } from "react";
import type { ReactNode } from "react";

/** Keeps a widget whose content throws from taking the dashboard with it: the
    frame stays and `fallback` stands in the body. The content gets another try
    when `size` or `options` are not the ones it failed with. */
export class Failed extends Component<{ fallback: ReactNode; size: string; options: unknown; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidUpdate(before: { size: string; options: unknown }) {
    if (this.state.failed && (before.size !== this.props.size || before.options !== this.props.options)) this.setState({ failed: false });
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

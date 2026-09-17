export default function WhyUmrissProvider() {
  return (
    <>
      <h3>It is optional, and that is the decision</h3>
      <p>
        Every component renders without a provider exactly as it does with one. The context has{" "}
        <code>null</code> as its base value, and the hooks then hand back the defaults - no
        provider, no warning, no difference. That is what lets this library be introduced component
        by component instead of application by application, and it is worth more than the slightly
        shorter code a mandatory provider would allow.
      </p>
      <p>
        It holds five things and no more: theme, density, portal target for overlays, the setting
        for toasts, and formats and wording. The moment it could set the default variant of a
        button it would be a second interface beside the components&rsquo; own props - and two ways
        of saying the same thing are worse than one.
      </p>

      <h3>The wording is a register, not a translation call</h3>
      <p>
        Every entry is named after what it labels, not after what it says.{" "}
        <code>t(&quot;clear.input&quot;)</code> asks its caller to know a key that nothing checks,
        and hands back the key itself when it is wrong. A field on a type asks nothing: whoever
        leaves it out gets the default, and whoever mistypes it gets a type error.
      </p>
      <p>
        Overriding is entry by entry. A caller who passes one entry changes that one entry;
        everything else keeps standing. A missing entry falls back on the default and never on an
        empty text or a key name - that is the difference between an incomplete translation and a
        broken surface.
      </p>

      <h3>English is the default, German is freight you take on purpose</h3>
      <p>
        <code>DEFAULT_WORDING</code> is English and is what the examples above render without a
        provider. German ships as <code>GERMAN_WORDING</code> behind the subpath{" "}
        <code>@umriss-ui/core/wording/de</code> - a subpath and not a name in the barrel, so that an
        application which never imports it never pays for it, and one that does has written the
        language it wants into an import line. See{" "}
        <code>docs/adr/0019-two-wordings-ship-english-is-the-default.md</code>.
      </p>
      <p>
        Both objects are typed <code>Wording</code>. That is the whole conformance mechanism: an
        entry added to the interface and forgotten in either one is a compile error before it can
        become a missing label on a screen. What nothing catches is drift - a German entry that has
        come to say something other than its English counterpart. They are two texts, not a
        translation of one another, and that is the accepted price of shipping two.
      </p>
      <p>
        Selecting a language is not something this library does. The seam takes any object typed{" "}
        <code>Wording</code>, entry by entry or whole; a third language is an application&rsquo;s
        business.
      </p>

      <h3>The formats are a register of their own</h3>
      <p>
        <code>DEFAULT_FORMATS</code> writes dates, numbers and durations in <code>de-DE</code>,
        whatever the wording says. The mixture is visible - an English wording over German number
        notation renders &bdquo;43 of 1.204&ldquo; - and it is left standing rather than folded into
        the wording, because the locale of the formats is a decision about a different object.
      </p>

      <h3>Why theme and density are not photographed here</h3>
      <p>
        Both write on the root element - <code>data-theme</code> and <code>data-density</code>, the
        attributes the token layers already listen to. An example that set them would not colour its
        own block but the whole page around it, and the picture taken of it would be a picture of
        the demo and not of the provider. They are in the table below, and the theme switch in the
        header of this demo is the running proof.
      </p>
    </>
  );
}

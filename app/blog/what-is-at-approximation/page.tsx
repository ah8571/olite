import type { Metadata } from "next";
import Link from "next/link";

import { ArticleSources } from "@/components/article-sources";
import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";

export const metadata: Metadata = {
  title: "What Is AT Approximation In Accessibility Testing?",
  description:
    "A practical explanation of assistive-technology approximation, how browser accessibility signals relate to screen readers, and where automation still needs manual review.",
  openGraph: {
    title: "What Is AT Approximation In Accessibility Testing? | Olite",
    description:
      "Understand assistive-technology approximation, why accessibility tools inspect browser signals instead of pretending to be real screen readers, and where manual testing still matters.",
    url: "https://olite.dev/blog/what-is-at-approximation"
  }
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "why-tools-use-it", label: "Why Tools Use It" },
  { id: "technical-stack", label: "The Technical Stack" },
  { id: "what-it-can-catch", label: "What It Can Catch" },
  { id: "where-it-stops", label: "Where It Stops" },
  { id: "how-olite-uses-it", label: "How Olite Uses It" },
  { id: "how-to-read-results", label: "How To Read Results" }
];

export default function WhatIsAtApproximationPage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Guide"
        title="What Is AT Approximation In Accessibility Testing?"
        description="Assistive-technology approximation is a browser-based way to estimate what screen-reader and keyboard users are likely to encounter, without claiming that a tool has literally run NVDA, JAWS, VoiceOver, or TalkBack."
        noteTitle="The short version"
        note="Good accessibility automation checks the browser signals that assistive technologies depend on: structure, accessible names, roles, states, focus movement, and notification of changes. That is much stronger than linting, but still different from a real human using a real screen reader."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />

          <div className="blog-content">
            <section className="section-panel article-section" id="overview">
              <p className="kicker">Overview</p>
              <p className="section-copy">
                AT approximation means checking the part of the web platform that assistive technology can
                actually perceive and react to, then using that evidence to predict likely user-facing
                failures. In practical terms, a browser builds an accessibility tree from the DOM, exposes
                names, roles, descriptions, and states through platform accessibility APIs, and screen
                readers consume that information to announce and navigate a page. If the browser layer is
                missing the right structure or state, the downstream assistive-technology experience is often
                wrong too <ArticleSources items={[{ href: "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree", label: "MDN" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }]} />
              </p>
              <p className="section-copy">
                That is why modern accessibility products rarely try to impersonate a specific screen reader.
                Instead, they inspect whether the browser is exposing the semantic and interaction signals that
                screen readers, switch devices, speech input tools, and keyboard users need. The idea is not
                to fake a spoken transcript. The idea is to ask whether the page has preserved programmatic
                structure, programmatic labeling, and state changes well enough that assistive technology has a
                fair chance to work reliably <ArticleSources items={[{ href: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships", label: "W3C WCAG 1.3.1" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }]} />
              </p>
              <div className="section-panel article-callout">
                <p className="kicker">Important Distinction</p>
                <p className="section-copy">
                  Real screen-reader testing asks, "What does a user actually hear and experience in a
                  particular assistive technology?" AT approximation asks, "Does the browser expose the
                  structure and behavior that a screen reader would normally depend on?"
                </p>
              </div>
            </section>

            <section className="section-panel article-section" id="why-tools-use-it">
              <p className="kicker">Why Tools Use It</p>
              <h2>Most accessibility products automate the browser layer first.</h2>
              <p className="section-copy">
                In broad terms, yes: this is the logic behind a large share of accessibility automation on the
                web. Different products emphasize different layers. Some stay close to static markup and known
                rule sets. Some execute the page in a browser and inspect rendered state, focus movement, and
                runtime changes. Some combine those checks with guided manual auditing. But the common pattern
                is that automated systems usually work upstream of real human assistive-technology use. They
                test the signals that should make assistive technology work, because that is where repeatable
                automation is most reliable.
              </p>
              <p className="section-copy">
                This is also why standards and guidance keep emphasizing programmatic determinability.
                Information that is only implied visually is fragile. If a heading only looks like a heading,
                if a required field is only red and not labelled as required, or if a custom widget visually
                changes state without exposing that state to assistive technology, the browser has lost the
                semantic contract that accessibility tools can inspect and that screen readers rely on <ArticleSources items={[{ href: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships", label: "W3C WCAG 1.3.1" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }]} />
              </p>
              <p className="section-copy">
                The phrase "AT approximation" is useful because it is honest. It admits that automated tools
                are not the same thing as a human using VoiceOver on Safari, NVDA on Firefox, JAWS on Chrome,
                or TalkBack on Android. But it also makes clear that automation can still say something
                meaningful. If the page never exposes a main landmark, if a button loses its accessible name
                after hydration, or if a dialog opens without moving focus into the modal, those are not vague
                theoretical concerns. They are strong signs that real assistive-technology users are likely to
                hit friction <ArticleSources items={[{ href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/", label: "WAI-ARIA APG Dialog Pattern" }, { href: "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree", label: "MDN" }]} />
              </p>
            </section>

            <section className="section-panel article-section" id="technical-stack">
              <p className="kicker">The Technical Stack</p>
              <h2>How this relates to screen readers technically</h2>
              <p className="section-copy">
                The simplest model has three layers. First, there is the rendered page: HTML, text, controls,
                ARIA, CSS-driven visibility, and client-side updates. Second, the browser converts that into an
                accessibility tree and related accessibility API output. Third, screen readers and other
                assistive technologies consume that information to announce roles, names, states, relationships,
                and available actions. So when a tool inspects the browser tree, focus state, and ARIA changes,
                it is operating in the layer immediately before the screen reader <ArticleSources items={[{ href: "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree", label: "MDN" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }]} />
              </p>
              <p className="section-copy">
                That relationship explains why some checks are so valuable. WCAG 4.1.2 requires user interface
                components to expose name, role, and value programmatically, and it specifically calls out the
                need for notifications when those states change. This matters because assistive technology needs
                to understand what a control is, whether it is focused, whether it is selected or expanded, and
                whether a change just happened. If a custom control never updates aria-selected, aria-expanded,
                or focus state correctly, a screen reader can only work with incomplete information <ArticleSources items={[{ href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }, { href: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/", label: "WAI-ARIA APG Tabs Pattern" }, { href: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/", label: "WAI-ARIA APG Disclosure Pattern" }]} />
              </p>
              <p className="section-copy">
                Structure matters at the same level. WCAG 1.3.1 explains that information, structure, and
                relationships conveyed visually should be programmatically determinable so they survive when the
                presentation format changes, including when content is read by a screen reader. In other words,
                AT approximation is not inventing a new philosophy. It is operationalizing the standards idea
                that semantics and relationships need to survive translation into machine-readable form
                <ArticleSources items={[{ href: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships", label: "W3C WCAG 1.3.1" }]} />
              </p>
            </section>

            <section className="section-panel article-section" id="what-it-can-catch">
              <p className="kicker">What It Can Catch</p>
              <h2>AT approximation is strongest when it checks specific structural and interaction contracts.</h2>
              <p className="section-copy">
                The highest-confidence checks usually map to concrete browser obligations. A few examples make
                that clearer. If a page visually looks like it has a main region and a primary heading, but the
                accessibility tree suppresses or strips those nodes, heading and landmark navigation become less
                reliable for screen-reader users. If a visible button or link loses its accessible name after a
                client-side render, the control may still look fine while becoming vague or effectively silent
                in assistive technology. Those are precisely the kinds of mismatches a browser-based tool can
                inspect consistently <ArticleSources items={[{ href: "https://developer.mozilla.org/en-US/docs/Glossary/Accessibility_tree", label: "MDN" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships", label: "W3C WCAG 1.3.1" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }]} />
              </p>
              <p className="section-copy">
                Interaction patterns are another strong area. The WAI-ARIA Authoring Practices define how
                dialogs, tabs, and disclosures are expected to behave, including the roles, states, and focus
                conventions that make them understandable. A dialog should move focus into the modal when it
                opens and usually return focus to the invoking control when it closes. Tabs should expose a
                tablist, tabs, and tabpanels, and the active tab should carry aria-selected=true while its
                associated panel is displayed. Disclosures should expose a button and synchronize aria-expanded
                with the visible state of the controlled content. These are not abstract ideals. They are
                testable interaction contracts <ArticleSources items={[{ href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/", label: "WAI-ARIA APG Dialog Pattern" }, { href: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/", label: "WAI-ARIA APG Tabs Pattern" }, { href: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/", label: "WAI-ARIA APG Disclosure Pattern" }]} />
              </p>
              <p className="section-copy">
                Validation and announcement behavior also fits this model. WCAG 3.3.1 requires that detected
                input errors be identified and described in text. In practice, error handling becomes much more
                usable when focus moves to the field or summary that needs attention, and when alert, status,
                or live-region semantics make the change perceptible after interaction. A tool still cannot say
                exactly how each screen reader will phrase the message, but it can say whether the browser was
                given a reasonable announcement path in the first place <ArticleSources items={[{ href: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification", label: "W3C WCAG 3.3.1" }, { href: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html", label: "W3C WCAG 4.1.2" }]} />
              </p>
              <ul className="bullet-list">
                <li>Main landmarks and primary headings that disappear from the accessibility tree after render</li>
                <li>Visible controls that lose their accessible names or keep weak generic names</li>
                <li>Dialogs that open visually without moving focus into the modal</li>
                <li>Disclosures that look open but never update aria-expanded</li>
                <li>Tabs that change panels visually but never expose the newly selected tab state</li>
                <li>Validation errors that appear on screen without a clear focus or announcement path</li>
              </ul>
            </section>

            <section className="section-panel article-section" id="where-it-stops">
              <p className="kicker">Where It Stops</p>
              <h2>AT approximation is useful, but it does not replace real assistive-technology testing.</h2>
              <p className="section-copy">
                There are important things approximation cannot guarantee. It cannot tell you the exact spoken
                phrasing a user will hear in NVDA versus VoiceOver. It cannot prove whether browse mode,
                quick-nav shortcuts, rotor navigation, verbosity settings, punctuation settings, or virtual
                cursor behavior will feel efficient in every combination of browser and assistive technology.
                It also cannot fully capture the cognitive side of a workflow, such as whether a complex multi-
                step task remains understandable after repeated context changes.
              </p>
              <p className="section-copy">
                Dialog guidance itself hints at the limit. The APG explains that focus placement can depend on
                the size and semantics of the dialog content, and that some dialog descriptions should not be
                flattened into a single aria-describedby announcement when structural reading is needed. A tool
                can flag obvious focus failures and missing labels, but a human tester is still better at
                judging whether the spoken experience is actually comfortable, efficient, and understandable in
                context <ArticleSources items={[{ href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/", label: "WAI-ARIA APG Dialog Pattern" }]} />
              </p>
              <p className="section-copy">
                The same applies to error flows. WCAG 3.3.1 says users need to know an error exists and what is
                wrong. A scanner can check for text errors, aria-invalid, focus movement, or alert semantics,
                but it cannot fully judge whether the wording is calm, specific, and easy to recover from across
                every assistive-technology path. So the right posture is not "automation or manual testing." It
                is "automation for high-confidence detection, manual testing for nuanced confirmation and task
                quality."
              </p>
            </section>

            <section className="section-panel article-section" id="how-olite-uses-it">
              <p className="kicker">How Olite Uses It</p>
              <h2>Olite uses AT approximation as a browser evidence layer, not as a claim of literal screen-reader execution.</h2>
              <p className="section-copy">
                In Olite, the phrase is intentionally narrow. It means the desktop browser audit samples the
                rendered page, inspects browser-exposed accessibility structure, and tests interaction behavior
                that strongly affects assistive-technology outcomes. Today that includes checks around
                accessibility-tree exposure for primary structure, critical control naming after render,
                validation announcement risk, dialog focus entry and return, disclosure state exposure, and tab
                selected-state plus controlled-panel exposure. The product language is careful here: these are
                high-confidence approximation findings, not literal recordings of what a specific screen reader
                announced.
              </p>
              <p className="section-copy">
                That distinction is part of the trust model. Olite should be comfortable saying, "The browser
                evidence suggests a likely assistive-technology problem," because that is defensible and useful.
                It should not say, "We tested this in every screen reader and know the exact spoken failure,"
                because that would overstate what automation did. The product boundary matters more as Olite
                adds richer browser checks.
              </p>
              <div className="section-panel article-callout">
                <p className="kicker">Related Olite Pages</p>
                <div className="article-link-list">
                  <Link href="/what-olite-checks">What Olite Checks</Link>
                  <Link href="/blog/what-is-global-privacy-control">What Is Global Privacy Control?</Link>
                  <Link href="/tools/accessibility">Free Accessibility Scanner</Link>
                </div>
              </div>
            </section>

            <section className="section-panel article-section" id="how-to-read-results">
              <p className="kicker">How To Read Results</p>
              <h2>Treat AT approximation as a confidence layer, not a marketing slogan.</h2>
              <p className="section-copy">
                A useful way to read these findings is in three steps. First, ask whether the issue is a strong
                browser contract failure, such as a missing accessible name, an incorrect selected state, or
                focus failing to move into a dialog. Second, ask whether the issue happens after hydration or
                interaction, because those runtime failures are easy to miss in static inspection. Third, ask
                whether the affected workflow is high risk enough to justify follow-up manual testing with a
                real screen reader.
              </p>
              <p className="section-copy">
                That workflow keeps teams honest. It also makes automation much more valuable. Instead of using
                a scanner as a compliance theatre tool, teams can use it to isolate the places where semantics,
                focus, state, and announcements are breaking down, and then reserve manual testing for the
                flows that matter most. That is the real promise of AT approximation: not replacing assistive-
                technology testing, but making it more targeted, more evidence-based, and more scalable.
              </p>
              <ul className="bullet-list">
                <li>Use automation to catch strong structural and interaction failures early</li>
                <li>Use browser evidence to prioritize manual testing where the user impact is highest</li>
                <li>Keep product language honest about approximation versus direct assistive-technology testing</li>
              </ul>
              <div className="hero-actions compact">
                <Link className="button" href="/what-olite-checks">
                  See what Olite checks
                </Link>
                <Link className="button-secondary" href="/blog">
                  Browse more guides
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
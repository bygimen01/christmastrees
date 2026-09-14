import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const ReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const Observed = new WeakSet<Element>();
    let Intersection: IntersectionObserver | null = null;

    const Reveal = (Element: Element) => {
      Element.classList.add("is-visible");
    };

    if (!ReducedMotion) {
      Intersection = new IntersectionObserver(
        (Entries) => {
          Entries.forEach((Entry) => {
            if (Entry.isIntersecting) {
              Reveal(Entry.target);
              Intersection?.unobserve(Entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
      );
    }

    const ObserveElement = (Element: Element) => {
      if (Observed.has(Element)) {
        return;
      }

      Observed.add(Element);
      if (ReducedMotion || Element.getBoundingClientRect().top < window.innerHeight * 0.96) {
        Reveal(Element);
        return;
      }

      Intersection?.observe(Element);
    };

    const ObserveTree = (Root: ParentNode) => {
      if (Root instanceof Element && Root.matches("[data-reveal]")) {
        ObserveElement(Root);
      }

      Root.querySelectorAll?.("[data-reveal]").forEach(ObserveElement);
    };

    ObserveTree(document.body);

    const Mutation = new MutationObserver((Records) => {
      Records.forEach((Record) => {
        Record.addedNodes.forEach((Node) => {
          if (Node instanceof Element) {
            ObserveTree(Node);
          }
        });
      });
    });

    Mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      Mutation.disconnect();
      Intersection?.disconnect();
    };
  }, []);
}

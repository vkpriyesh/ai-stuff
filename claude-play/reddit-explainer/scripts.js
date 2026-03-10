/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDDIT EXPLAINER - JAVASCRIPT INTERACTIONS
 * 
 * Purpose: Enhance understanding through meaningful animations and interactions
 * 
 * Includes:
 * - Scroll-triggered reveal animations
 * - Headline rotation (hero section)
 * - Smooth scroll behavior
 * - Intersection Observer for performance
 * 
 * Accessibility: All interactions respect prefers-reduced-motion
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Check if user prefers reduced motion
   * @returns {boolean}
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  /**
   * Debounce function for performance
   * @param {Function} fn - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function}
   */
  const debounce = (fn, wait = 100) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCROLL-TRIGGERED ANIMATIONS
  // 
  // Animation meaning: Progressive revelation as user explores
  // Content appears as they scroll, creating a sense of discovery
  // and preventing cognitive overload from seeing everything at once
  // ─────────────────────────────────────────────────────────────────────────

  const initScrollAnimations = () => {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion()) {
      document.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.add('animate-in');
      });
      return;
    }

    const animatedElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px', // Trigger slightly before element is fully visible
      threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.delay || 0;

          // Apply delay for staggered animations
          setTimeout(() => {
            el.classList.add('animate-in');
          }, parseInt(delay, 10));

          // Stop observing once animated
          observer.unobserve(el);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HERO HEADLINE ROTATION
  // 
  // Animation meaning: Shows different ways to understand Reddit
  // Each headline variation captures a different aspect, helping
  // users find the explanation that resonates with them
  // ─────────────────────────────────────────────────────────────────────────

  const initHeadlineRotation = () => {
    const headlines = document.querySelectorAll('.headline-variation');
    if (headlines.length === 0) return;

    // Skip rotation if user prefers reduced motion
    if (prefersReducedMotion()) {
      headlines[0].classList.add('active');
      return;
    }

    let currentIndex = 0;
    const rotationInterval = 5000; // 5 seconds per headline

    const rotateHeadline = () => {
      // Remove active from current
      headlines[currentIndex].classList.remove('active');

      // Move to next
      currentIndex = (currentIndex + 1) % headlines.length;

      // Add active to new current
      headlines[currentIndex].classList.add('active');
    };

    // Start rotation
    setInterval(rotateHeadline, rotationInterval);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // 
  // Purpose: Gentle transitions between sections, maintaining context
  // of where the user is on the page
  // ─────────────────────────────────────────────────────────────────────────

  const initSmoothScroll = () => {
    // Only enhance if browser supports smooth scroll behavior
    if (!('scrollBehavior' in document.documentElement.style)) return;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        
        // Skip if it's just "#"
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          e.preventDefault();

          // Scroll with offset for potential fixed headers
          const offset = 32;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: prefersReducedMotion() ? 'auto' : 'smooth'
          });

          // Update focus for accessibility (screen readers)
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      });
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FAQ ACCORDION ENHANCEMENT
  // 
  // Animation meaning: Expand/collapse reveals answers progressively,
  // letting users dig deeper into topics they're curious about
  // ─────────────────────────────────────────────────────────────────────────

  const initFAQInteractions = () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const summary = item.querySelector('summary');
      
      // Ensure keyboard accessibility
      summary.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.open = !item.open;
        }
      });
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VOTING DEMO ANIMATION
  // 
  // Animation meaning: Shows how upvotes cause content to rise
  // Makes the abstract concept of voting tangible
  // ─────────────────────────────────────────────────────────────────────────

  const initVotingDemo = () => {
    const votingSection = document.querySelector('.step-animation--voting');
    if (!votingSection || prefersReducedMotion()) return;

    const risingPost = votingSection.querySelector('.vote-post--rising');
    if (!risingPost) return;

    // Simulate an upvote click animation
    let voteCount = 67;
    const countDisplay = risingPost.querySelector('.vote-count');

    const observerOptions = {
      threshold: 0.5
    };

    const simulateVote = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Animate the vote count up
          const interval = setInterval(() => {
            voteCount++;
            countDisplay.textContent = voteCount;

            if (voteCount >= 70) {
              clearInterval(interval);
              countDisplay.textContent = '70';
            }
          }, 200);
        }
      });
    };

    const observer = new IntersectionObserver(simulateVote, observerOptions);
    observer.observe(votingSection);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SCROLL INDICATOR HIDE ON SCROLL
  // 
  // Purpose: Once user starts scrolling, the hint is no longer needed
  // ─────────────────────────────────────────────────────────────────────────

  const initScrollIndicator = () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    let hasScrolled = false;

    const handleScroll = debounce(() => {
      if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      }
    }, 50);

    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TOPIC BUBBLE HOVER INTERACTIONS
  // 
  // Animation meaning: Topics react to attention, suggesting they're
  // clickable/explorable (in a real implementation)
  // ─────────────────────────────────────────────────────────────────────────

  const initTopicBubbles = () => {
    const bubbles = document.querySelectorAll('.topic-bubble');
    if (prefersReducedMotion()) return;

    bubbles.forEach(bubble => {
      bubble.addEventListener('mouseenter', () => {
        bubble.style.transform = 'scale(1.2)';
        bubble.style.zIndex = '10';
      });

      bubble.addEventListener('mouseleave', () => {
        bubble.style.transform = '';
        bubble.style.zIndex = '';
      });
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PATH CARD SELECTION FEEDBACK
  // 
  // Purpose: Visual feedback when hovering path options
  // ─────────────────────────────────────────────────────────────────────────

  const initPathCards = () => {
    const pathCards = document.querySelectorAll('.path-card');

    pathCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        // Slightly dim the other card
        pathCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.style.opacity = '0.85';
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        // Restore all cards
        pathCards.forEach(otherCard => {
          otherCard.style.opacity = '';
        });
      });
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // USE CASE TILE STAGGER ANIMATION
  // 
  // Animation meaning: Tiles appearing one by one suggests there's
  // always more to discover - Reddit's breadth becomes apparent
  // ─────────────────────────────────────────────────────────────────────────

  const initUseCaseTileAnimations = () => {
    if (prefersReducedMotion()) return;

    const tiles = document.querySelectorAll('.use-case-tile');
    
    // Add staggered delays to tiles that don't have them
    tiles.forEach((tile, index) => {
      if (!tile.dataset.delay) {
        tile.dataset.delay = String(100 + (index * 50));
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMMUNITY CARD ICON ANIMATION
  // 
  // Purpose: Subtle bounce on icon when card is in view
  // ─────────────────────────────────────────────────────────────────────────

  const initCommunityCardAnimations = () => {
    if (prefersReducedMotion()) return;

    const cards = document.querySelectorAll('.community-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const icon = entry.target.querySelector('.community-card__icon');
          if (icon) {
            icon.style.animation = 'bounce 0.5s ease-out';
          }
        }
      });
    }, { threshold: 0.5 });

    cards.forEach(card => observer.observe(card));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // KEYBOARD NAVIGATION ENHANCEMENT
  // 
  // Purpose: Ensure all interactive elements are keyboard accessible
  // ─────────────────────────────────────────────────────────────────────────

  const initKeyboardNavigation = () => {
    // Handle Enter key on buttons styled as links
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('btn')) {
        e.target.click();
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZE ALL MODULES
  // ─────────────────────────────────────────────────────────────────────────

  const init = () => {
    // Core functionality
    initScrollAnimations();
    initHeadlineRotation();
    initSmoothScroll();
    initFAQInteractions();
    initKeyboardNavigation();

    // Enhanced interactions
    initScrollIndicator();
    initVotingDemo();
    initTopicBubbles();
    initPathCards();
    initUseCaseTileAnimations();
    initCommunityCardAnimations();

    // Log for debugging in development
    console.log('Reddit Explainer: All modules initialized');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RUN ON DOM READY
  // ─────────────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

"""Builds the Velaisance inner pages: html/about.html and html/service-<slug>.html.

The pages share one template. The top bar, header, final call to action,
footer and booking modal are copied from index.html (with paths pointed up
a folder), so they always match the homepage. Edit a service's copy in
SERVICES below, then run from the project root:

    python3 tools/build-pages.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANNER_WAVE = '''            <div class="section-divider section-divider--banner" aria-hidden="true">
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" width="1000" height="100"><g fill="currentColor"><path d="M0 1v99c134.3 0 153.7-99 296-99H0Z" opacity=".5"/><path d="M1000 4v86C833.3 90 833.3 3.6 666.7 3.6S500 90 333.3 90 166.7 4 0 4h1000Z" opacity=".5"/><path d="M617 1v86C372 119 384 1 196 1h421Z" opacity=".5"/><path d="M1000 0H0v52C62.5 28 125 4 250 4c250 0 250 96 500 96 125 0 187.5-24 250-48V0Z"/></g></svg>
            </div>
'''
BOOK = "https://book.prospyrmed.com/4cce81ef-f2c5-4e11-8446-f26833523e22/select-service?workspaceId=25875597-275b-4d12-b427-3f18097b015f&amp;locationId=57bc5251-1073-4fe5-9a47-7d9fa82c98e7"

# PLACEHOLDER copy: written from the homepage service cards. Swap in her own
# wording, prices and FAQs as she sends them.
SERVICES = [
    {
        "slug": "gleaux-concierge", "name": "The Gleaux Concierge", "tag": "At-Home Luxury",
        "price": "From $350", "time": "By appointment",
        "title": "Velaisance, Wherever You Are",
        "intro": [
            "The Gleaux Concierge brings the Velaisance experience to your home, hotel, office, or event. Dr. Synedra Coleman and her team arrive with everything needed for clinical-grade care in a setting that feels completely yours.",
            "It is ideal for busy schedules, private recovery, bridal parties, and special occasions, with the same doctorate-level standards you would expect in the studio.",
        ],
        "benefits": ["Treatments in your home, hotel, or venue", "Nurse practitioner-led, every visit", "IV hydration and wellness on demand", "Glow-ready care for events and bridal parties", "Private, discreet appointments", "Medical-grade supplies brought to you", "Flexible early and evening times", "Serving Walnut Creek and the Bay Area"],
        "expect_title": "What to Expect",
        "expect": "After a short consultation call, we confirm your treatments, guest count, and location. On the day, we set up a calm, clean treatment space, care for each guest one on one, and leave everything as we found it.",
        "faqs": [
            ("Where does the Gleaux Concierge travel?", "We serve Walnut Creek and the greater Bay Area. Ask about travel to other locations when you book."),
            ("Which treatments are available on location?", "IV hydration, wellness therapies, and select aesthetic treatments can be performed on location. We will confirm what is right for your setting during your consultation."),
            ("Can you care for a group?", "Yes. Concierge visits are popular for bridal parties, retreats, and celebrations. Share your guest count when you book so we can plan the visit."),
            ("How far ahead should I book?", "We recommend booking at least one week ahead, and earlier for weekends and events."),
        ],
    },
    {
        "slug": "med-spa", "name": "Med Spa Services", "tag": "Aesthetics",
        "price": "From $250", "time": "45–60 min",
        "title": "Clinical Precision, Natural Results",
        "intro": [
            "Our med spa services combine advanced aesthetic treatments with the judgment of a doctorate-prepared nurse practitioner. Every plan starts with a consultation so your results look refreshed, balanced, and unmistakably you.",
            "From injectables to microneedling, each treatment is performed with medical-grade products and careful technique.",
        ],
        "benefits": ["Injectables for softened lines", "Microneedling for texture and tone", "Advanced skin rejuvenation", "Personalized treatment plans", "Medical-grade products", "Natural, refined results", "Nurse practitioner-led care", "Follow-up support after every visit"],
        "expect_title": "What to Expect",
        "expect": "Your first visit begins with a consultation about your goals and medical history. Dr. Coleman will recommend a plan, explain each step, and make sure you feel comfortable before any treatment begins.",
        "faqs": [
            ("Is a consultation required?", "Yes. Every new client starts with a consultation so we can design a safe plan around your goals and health history."),
            ("How long do results last?", "It depends on the treatment. Injectables typically last several months, while skin treatments build results over a series of visits."),
            ("Is there downtime?", "Most treatments have little to no downtime. We will walk you through aftercare for your specific treatment."),
            ("Who performs the treatments?", "Treatments are performed or directly overseen by Dr. Synedra Coleman, DNP, FNP."),
        ],
    },
    {
        "slug": "wellness", "name": "Wellness by Velaisance", "tag": "Holistic Wellness",
        "price": "From $150", "time": "60 min",
        "title": "Whole-Body Wellness, Rooted in Science",
        "intro": [
            "Wellness by Velaisance supports how you feel, not just how you look. Our restorative therapies are grounded in nursing science and designed to renew your energy, balance, and vitality.",
            "Each program is personalized after a conversation about your lifestyle, goals, and health history.",
        ],
        "benefits": ["Personalized wellness plans", "Support for energy and balance", "Restorative therapies", "Nutrition and lifestyle guidance", "Nursing science at the core", "Ongoing check-ins", "Calm, private sessions", "Care that fits your schedule"],
        "expect_title": "What to Expect",
        "expect": "We begin with a thorough wellness consultation, then build a plan that fits your routine. Follow-up visits help us adjust your care as your needs change.",
        "faqs": [
            ("Who is wellness care for?", "Anyone looking to feel more energized, balanced, and supported, from busy professionals to new parents."),
            ("Do I need labs before starting?", "Some programs benefit from recent lab work. We will let you know during your consultation."),
            ("How often should I come in?", "Most clients start with a short series of visits, then move to regular maintenance."),
            ("Can wellness be combined with other services?", "Yes. Wellness pairs beautifully with IV hydration and skincare for a full-circle plan."),
        ],
    },
    {
        "slug": "skinsoul", "name": "SkinSoul Collective", "tag": "Skincare",
        "price": "From $175", "time": "75 min",
        "title": "Facials Curated for Skin and Soul",
        "intro": [
            "The SkinSoul Collective pairs results-driven facials and LED light therapy with an unhurried, restorative ritual. Every treatment is tailored to your skin's needs on the day you arrive.",
            "Expect visible glow, calmer skin, and a reset for your mind as much as your complexion.",
        ],
        "benefits": ["Customized signature facials", "LED light therapy", "Hydration and glow boosts", "Support for acne and congestion", "Calming, sensitive-skin care", "Professional-grade products", "Home-care recommendations", "A deeply relaxing ritual"],
        "expect_title": "What to Expect",
        "expect": "Your esthetic ritual begins with a skin analysis, followed by a customized facial and LED therapy. You will leave with a simple home routine to keep your results going.",
        "faqs": [
            ("How often should I get a facial?", "Every four to six weeks keeps skin balanced and glowing, though your plan may vary."),
            ("Is LED light therapy safe?", "Yes. LED therapy is gentle, non-invasive, and suitable for most skin types."),
            ("Can I wear makeup afterward?", "We recommend letting your skin breathe for the rest of the day for the best results."),
            ("What if I have sensitive skin?", "Every facial is customized, and sensitive skin receives gentle, calming products and techniques."),
        ],
    },
    {
        "slug": "iv-hydration", "name": "IV Hydration Therapy", "tag": "Infusions",
        "price": "From $199", "time": "45 min",
        "title": "Hydration and Nutrients, Delivered Directly",
        "intro": [
            "IV hydration therapy delivers fluids, vitamins, and nutrients directly into your bloodstream for fast, effective replenishment. Each infusion is customized to how you feel and what your body needs.",
            "Clients choose IV therapy for energy, recovery, immune support, travel, and that lit-from-within glow.",
        ],
        "benefits": ["Customized vitamin blends", "Fast, effective hydration", "Support for energy and recovery", "Immune support", "Relief after travel or long weeks", "Nurse practitioner-administered", "Comfortable, private setting", "Available in-studio or on location"],
        "expect_title": "What to Expect",
        "expect": "A brief health screening comes first, then we recommend an infusion for your goals. Most drips take about 45 minutes, and you can relax, read, or rest throughout.",
        "faqs": [
            ("Does an IV infusion hurt?", "Most clients feel only a quick pinch when the IV is placed, then nothing but comfort."),
            ("How soon will I feel the benefits?", "Many clients feel refreshed within hours, with full benefits over the following day."),
            ("Is IV therapy safe?", "Yes, when screened and administered by a qualified clinician. Every infusion is overseen by Dr. Coleman."),
            ("Can I get IV therapy at home?", "Yes. IV hydration is available through the Gleaux Concierge in your home, hotel, or event."),
        ],
    },
    {
        "slug": "elixir-vanity", "name": "The Elixir Vanity", "tag": "Curated Shop",
        "price": "From $45", "time": "Shop online",
        "title": "Your Glow, Extended at Home",
        "intro": [
            "The Elixir Vanity is our curated collection of professional-grade skincare and wellness essentials. Every product is selected to support your treatments and keep your results going between visits.",
            "Not sure where to start? We are happy to recommend a routine based on your skin and goals.",
        ],
        "benefits": ["Professional-grade skincare", "Wellness essentials", "Products chosen by Dr. Coleman", "Routines for every skin type", "Support between treatments", "Gift-ready selections", "Simple, effective routines", "Personal recommendations"],
        "expect_title": "Finding Your Routine",
        "expect": "Shop online or ask during your next visit. We will match products to your skin and treatment plan so every step of your routine works together.",
        "faqs": [
            ("How do I choose the right products?", "Book a consultation or ask at your next visit, and we will build a routine for your skin."),
            ("Are the products medical-grade?", "Many are professional or medical-grade lines that are not sold in typical retail stores."),
            ("Can I buy gifts?", "Yes. The Elixir Vanity offers gift-ready selections for every budget."),
            ("Do you ship?", "Shipping options are available on the online shop. Local pickup is available at the studio."),
        ],
    },
]

CHEVRON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path d="m9 6 6 6-6 6"/></svg>'
CHECK = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>'
TAG = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'
CLOCK = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
PLUS = '<svg class="faq__icon" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg>'


def up(html):
    """Point homepage asset paths and in-page links up one folder."""
    html = re.sub(r'(href|src|srcset)="(?=(css|javascript|images|fonts)/)', r'\1="../', html)
    html = re.sub(r'srcset="([^"]*)"', lambda m: 'srcset="' + re.sub(r'(^|, )(images/)', r'\1../\2', m.group(1)) + '"', html)
    html = html.replace('href="index.html"', 'href="../index.html"')
    html = re.sub(r'href="#(?!main\b)([\w-]+)"', r'href="../index.html#\1"', html)
    # Links to sibling service pages are already in html/
    html = html.replace('href="../html/', 'href="').replace('href="html/', 'href="')
    return html


def picture(base, alt, w, h, sizes=None, lazy=True, mobile=None):
    load = ' loading="lazy" decoding="async"' if lazy else ' fetchpriority="high"'
    if mobile:
        webp = f'srcset="../images/{mobile}.webp 480w, ../images/{base}.webp {w}w" sizes="{sizes}"'
        jpg = f' srcset="../images/{mobile}.jpg 480w, ../images/{base}.jpg {w}w" sizes="{sizes}"'
    else:
        webp, jpg = f'srcset="../images/{base}.webp"', ""
    return (f'<picture>\n                            <source {webp} type="image/webp">\n'
            f'                            <img src="../images/{base}.jpg"{jpg} alt="{alt}" width="{w}" height="{h}"{load}>\n'
            f'                        </picture>')


def sidebar(active):
    links = ""
    for s in SERVICES:
        on = s["slug"] == active
        cls = "sd-nav__link is-current" if on else "sd-nav__link"
        cur = ' aria-current="page"' if on else ""
        links += f'\n                        <li><a class="{cls}" href="service-{s["slug"]}.html"{cur}>{s["name"]}{CHEVRON}</a></li>'
    return f'''<aside class="sd-aside">
                    <nav class="sd-nav" aria-label="All services">
                        <p class="sd-nav__title">Our Services</p>
                        <ul class="sd-nav__list">{links}
                        </ul>
                    </nav>

                    <div class="sd-book">
                        <span class="sd-book__glow" aria-hidden="true"></span>
                        <p class="badge"><span class="badge__dot" aria-hidden="true"></span>Begin Your Glow</p>
                        <h2 class="sd-book__title">Ready for Expert, Personalized Care?</h2>
                        <p class="sd-book__text">Book a consultation and Dr. Coleman will design a plan around your goals.</p>
                        <a class="button button--primary" href="{BOOK}" target="_blank" rel="noopener" data-booking>Book a Consultation</a>
                        <a class="sd-book__phone" href="tel:+16282528115">or call 628-252-8115</a>
                    </div>
                </aside>'''


def page_body(s):
    benefits = "".join(f"\n                            <li>{CHECK}<span>{b}</span></li>" for b in s["benefits"])
    intro = "".join(f"\n                        <p>{p}</p>" for p in s["intro"])
    faqs = "".join(f'''
                            <details class="faq__item"{" open" if i == 0 else ""}>
                                <summary class="faq__question">{q}{PLUS}</summary>
                                <div class="faq__answer"><p>{a}</p></div>
                            </details>''' for i, (q, a) in enumerate(s["faqs"]))
    main_img = picture(f"services/details/{s['slug']}-main", f"{s['name']} at Velaisance Aesthetics &amp; Wellness",
                       720, 450, "(min-width: 1100px) 46rem, 92vw", lazy=False, mobile=f"services/details/{s['slug']}-main-m")
    return f'''        <!-- ============ Page banner ============ -->
        <section class="page-banner" aria-labelledby="sd-title">
            <div class="container page-banner__inner">
                <nav class="page-crumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="../index.html">Home</a></li>
                        <li><a href="../index.html#services">Services</a></li>
                        <li aria-current="page">{s["name"]}</li>
                    </ol>
                </nav>
                <h1 class="page-banner__title" id="sd-title">{s["name"]}</h1>
                <p class="page-banner__tag">{s["tag"]}</p>
            </div>
{BANNER_WAVE}        </section>

        <!-- ============ Service details: services list left, details right ============ -->
        <section class="sd">
            <span class="sd__bouquet" aria-hidden="true"></span>
            <span class="particles particles--gold" aria-hidden="true"></span>
            <div class="container sd__inner">
                <!-- Each row pins its own side column, so the two never overlap -->
                <div class="sd__row">
                {sidebar(s["slug"])}

                <article class="sd-main">
                    <div class="sd-main__photo">
                        {main_img}
                    </div>

                    <ul class="sd-meta">
                        <li>{TAG}{s["price"]}</li>
                        <li>{CLOCK}{s["time"]}</li>
                    </ul>

                    <h2 class="sd-main__title">{s["title"]}</h2>
                    <div class="sd-main__text">{intro}
                    </div>

                    <ul class="sd-checks">{benefits}
                    </ul>

                    <h2 class="sd-main__title">{s["expect_title"]}</h2>
                    <div class="sd-main__text">
                        <p>{s["expect"]}</p>
                    </div>

                    <div class="sd-photos">
                        <div class="sd-photos__item">
                            {picture("services/details/detail-consult", "Dr. Coleman consulting with a client", 560, 747)}
                        </div>
                        <div class="sd-photos__item">
                            {picture("services/details/detail-glow", "A client relaxing after a treatment", 560, 747)}
                        </div>
                    </div>
                </article>
                </div>

                <div class="sd__row">
                <!-- PLACEHOLDER hours: confirm with client (footer says Tue–Sat, by appointment) -->
                <aside class="sd-hours" aria-label="Office hours">
                    <p class="sd-nav__title">Office Hours</p>
                    <dl class="sd-hours__list">
                        <div><dt>Tuesday – Friday</dt><dd>10:00 AM – 7:00 PM</dd></div>
                        <div><dt>Saturday</dt><dd>9:00 AM – 4:00 PM</dd></div>
                        <div><dt>Sunday – Monday</dt><dd>Closed</dd></div>
                    </dl>
                    <p class="sd-hours__note">All visits are by appointment. Gleaux Concierge visits can be scheduled outside these hours.</p>
                </aside>

                <div class="faq" aria-labelledby="faq-title">
                    <h2 class="sd-main__title" id="faq-title">Frequently Asked Questions</h2>
                    <div class="faq__list">{faqs}
                    </div>
                </div>
                </div>
            </div>
        </section>
'''


# ---------------------------------------------------------------------------
# About page. PLACEHOLDER copy: her story, years of experience and stats are
# written from the homepage; confirm the details with her.
# ---------------------------------------------------------------------------
ICON = {
    "consult": '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    "plan": '<path d="M9 4h6v3H9z"/><path d="M7 5H5v15h14V5h-2"/><path d="m9 13 2 2 4-4"/>',
    "treat": '<path d="M12 3c.4 4 2.3 6.6 6.5 7.5v.8c-4.2.9-6.1 3.5-6.5 7.5h-.8c-.4-4-2.3-6.6-6.5-7.5v-.8C9.4 9.6 11.3 7 11.7 3z"/>',
    "glow": '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "shield": '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "home": '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
}


def icon(name, size=24):
    return f'<svg aria-hidden="true" viewBox="0 0 24 24" width="{size}" height="{size}">{ICON[name]}</svg>'


STATS = [  # (faint word behind, main heading, label)
    ("DNP", "Doctorate", "Doctor of Nursing Practice"),
    ("FNP", "Board&#8209;Certified", "Family Nurse Practitioner"),
    ("15+", "15+ Years", "In clinical nursing care"),  # PLACEHOLDER: confirm her years
    ("5.0", "5.0 Rated", "By Bay Area clients"),
]

PROCESS = [
    ("consult", "consultation", "Consultation", "A relaxed conversation about your goals, health history, and what you want to feel when you look in the mirror."),
    ("plan", "plan", "Your Personal Plan", "Dr. Coleman designs a plan around your skin, body, and schedule, with clear pricing before anything begins."),
    ("treat", "treatment", "Treatment &amp; Ritual", "Clinical-grade care delivered in a calm, private space, or wherever you are with the Gleaux Concierge."),
    ("glow", "glow", "Aftercare &amp; Glow", "Follow-up support, home-care guidance, and check-ins so your results keep glowing long after you leave."),
]

WHY = [
    ("shield", "Doctorate-Level Expertise", "Every treatment is led by a doctorate-prepared nurse practitioner, so safety and science come first."),
    ("heart", "Care That Feels Personal", "No templates. Your plan is built around your goals, your lifestyle, and how you want to feel."),
    ("home", "Luxury, Wherever You Are", "Visit our private studio or bring Velaisance home with the Gleaux Concierge mobile service."),
]


def about_body():
    stats = "".join(f'''
                    <li class="ab-stat">
                        <span class="ab-stat__ghost" aria-hidden="true">{ghost}</span>
                        <span class="ab-stat__value">{main}</span>
                        <span class="ab-stat__label">{label}</span>
                    </li>''' for ghost, main, label in STATS)
    steps = "".join(f'''
                    <li class="ab-step" tabindex="0">
                        <picture class="ab-step__bg" aria-hidden="true">
                            <source srcset="../images/about/process/process-{img}.webp" type="image/webp">
                            <img src="../images/about/process/process-{img}.jpg" alt="" width="440" height="550" loading="lazy" decoding="async">
                        </picture>
                        <div class="ab-step__top">
                            <span class="ab-step__icon">{icon(ic, 26)}</span>
                            <span class="ab-step__num">{i:02d}</span>
                        </div>
                        <h3 class="ab-step__title">{title}</h3>
                        <p class="ab-step__text">{text}</p>
                    </li>''' for i, (ic, img, title, text) in enumerate(PROCESS, 1))
    why = "".join(f'''
                        <li class="ab-why__item">
                            <span class="ab-why__icon">{icon(ic, 26)}</span>
                            <div>
                                <h3 class="ab-why__title">{title}</h3>
                                <p class="ab-why__text">{text}</p>
                            </div>
                        </li>''' for ic, title, text in WHY)
    tiles = [("why-treatment-room", "A Velaisance treatment room with a velvet-draped bed", 640, 480, "wide"),
             ("why-arrival", "A client relaxing in a robe in the Velaisance lounge", 480, 640, "tall"),
             ("why-iv-suite", "An emerald velvet IV hydration chair", 480, 640, "tall"),
             ("why-iv-lounge", "A client reading during an IV hydration session", 640, 480, "wide")]
    gallery = "".join(f'''
                    <div class="ab-why__photo ab-why__photo--{shape}">
                        {picture(f"about/why/{b}", alt, w, h)}
                    </div>''' for b, alt, w, h, shape in tiles)
    return f'''        <!-- ============ Page banner ============ -->
        <section class="page-banner" aria-labelledby="page-title">
            <div class="container page-banner__inner">
                <nav class="page-crumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="../index.html">Home</a></li>
                        <li aria-current="page">About</li>
                    </ol>
                </nav>
                <h1 class="page-banner__title" id="page-title">Meet the Nurse Alchemist</h1>
                <p class="page-banner__tag">Dr. Synedra Coleman, DNP, FNP</p>
            </div>
{BANNER_WAVE}        </section>

        <!-- ============ Story: portrait left, story + signature right, credentials below ============ -->
        <section class="ab-story" aria-labelledby="story-title">
            <span class="particles particles--gold" aria-hidden="true"></span>
            <div class="container">
                <div class="ab-story__grid">
                    <div class="ab-story__visual">
                        <span class="ab-story__frame" aria-hidden="true"></span>
                        <picture class="ab-story__portrait">
                            <source srcset="../images/about/dr-synedra-coleman-arch-m.webp 440w, ../images/about/dr-synedra-coleman-arch.webp 660w" sizes="(min-width: 1100px) 30rem, 88vw" type="image/webp">
                            <img src="../images/about/dr-synedra-coleman-arch.jpg" srcset="../images/about/dr-synedra-coleman-arch-m.jpg 440w, ../images/about/dr-synedra-coleman-arch.jpg 660w" sizes="(min-width: 1100px) 30rem, 88vw" alt="Dr. Synedra Coleman, founder of Velaisance Aesthetics &amp; Wellness" width="660" height="825" fetchpriority="high">
                        </picture>
                    </div>

                    <div class="ab-story__content">
                        <p class="badge badge--light"><span class="badge__dot" aria-hidden="true"></span>Our Story</p>
                        <h2 class="section-title" id="story-title">Where Clinical Science Meets <em>Sacred Self&#8209;Care</em></h2>
                        <div class="ab-story__text">
                            <p>I'm Dr. Synedra Coleman, a doctorate-prepared family nurse practitioner, and I founded Velaisance on a simple belief: you should never have to choose between medical expertise and true self-care.</p>
                            <p>After years in clinical nursing, I saw how often beauty and wellness felt rushed, impersonal, or uncertain. Velaisance is my answer: a luxury, nurse practitioner-led space where every injectable, facial, and IV infusion is grounded in science and delivered with warmth.</p>
                            <p>Whether you visit our Walnut Creek studio or invite us home through the Gleaux Concierge, you'll leave with a plan made for you and the confidence that comes from feeling cared for.</p>
                        </div>

                        <div class="ab-story__sign">
                            <p class="ab-story__signature" aria-hidden="true">Synedra Coleman</p>
                            <p class="ab-story__name">Dr. Synedra Coleman<span>Founder, DNP, FNP</span></p>
                        </div>
                    </div>
                </div>

                <ul class="ab-stats" aria-label="Credentials">{stats}
                </ul>
            </div>
        </section>

        <!-- ============ Process cards (photo + wash appear on hover) ============ -->
        <section class="ab-process" aria-labelledby="process-title">
            <span class="ab-process__pattern" aria-hidden="true"></span>
            <div class="container">
                <div class="ab-process__header">
                    <p class="badge"><span class="badge__dot" aria-hidden="true"></span>How It Works</p>
                    <h2 class="section-title" id="process-title">Your Journey to <em>Gleaux</em></h2>
                    <p class="section-intro">Four simple steps, from your first conversation to results that last.</p>
                </div>
                <ol class="ab-steps">{steps}
                </ol>
            </div>
        </section>

        <!-- ============ Why choose us: photo collage left, reasons right ============ -->
        <section class="ab-why" aria-labelledby="why-title">
            <div class="container ab-why__grid">
                <div class="ab-why__gallery">{gallery}
                </div>

                <div class="ab-why__content">
                    <p class="badge badge--light"><span class="badge__dot" aria-hidden="true"></span>Why Velaisance</p>
                    <h2 class="section-title" id="why-title">A Behind-the-Scenes Look at <em>Velaisance</em></h2>
                    <p class="section-intro">From your first consultation to your final glow, here is what makes care at Velaisance different.</p>
                    <ul class="ab-why__list">{why}
                    </ul>
                </div>
            </div>
        </section>
'''


# ---------------------------------------------------------------------------
# Reviews page. Video stories: PLACEHOLDER posters, names and quotes until she
# sends the client videos. To add one, drop the .mp4 in assets/videos/ and set
# its "video" path below (e.g. "../assets/videos/sabrina.mp4"), then rebuild.
# ---------------------------------------------------------------------------
VIDEOS = [
    {"poster": "poster-consultation", "name": "Sabrina J.", "service": "Med Spa Client", "length": "1:12", "video": "",
     "quote": "I felt heard from the very first consultation."},
    {"poster": "poster-glow", "name": "Tiana R.", "service": "SkinSoul Facial", "length": "0:58", "video": "",
     "quote": "My skin has honestly never looked this good."},
    {"poster": "poster-lounge", "name": "Monique D.", "service": "Wellness Client", "length": "1:30", "video": "",
     "quote": "It feels like a retreat, but the care is clinical."},
    {"poster": "poster-iv", "name": "Abigail Q.", "service": "IV Hydration", "length": "0:45", "video": "",
     "quote": "Forty-five minutes and I felt like myself again."},
    {"poster": "poster-facial", "name": "Gwen Z.", "service": "LED Therapy", "length": "1:05", "video": "",
     "quote": "Dr. Coleman explains everything before she begins."},
    {"poster": "poster-concierge", "name": "Alicia M.", "service": "Gleaux Concierge", "length": "1:20", "video": "",
     "quote": "She brought the whole spa to our bridal suite."},
]

PLAY = '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.5z"/></svg>'
QUOTE = '<svg class="vr-card__quote" aria-hidden="true" viewBox="0 0 24 24" width="28" height="28"><path d="M9.6 5C6 6.4 3.5 9.6 3.5 13.6V19h6.2v-6.2H6.6c0-2.6 1.4-4.7 3.9-5.8zm10 0c-3.6 1.4-6.1 4.6-6.1 8.6V19h6.2v-6.2h-3.1c0-2.6 1.4-4.7 3.9-5.8z"/></svg>'


def reviews_body(reviews_section):
    cards = ""
    for i, v in enumerate(VIDEOS):
        ready = bool(v["video"])
        state = "" if ready else " is-soon"
        label = f"Play {v['name']}'s video review" if ready else f"{v['name']}'s video review, coming soon"
        cards += f'''
                    <li>
                        <button class="vr-card{state}" type="button" data-video="{v["video"]}" data-title="{v["name"]}, {v["service"]}" aria-label="{label}">
                            <picture class="vr-card__poster">
                                <source srcset="../images/reviews/video/{v["poster"]}.webp" type="image/webp">
                                <img src="../images/reviews/video/{v["poster"]}.jpg" alt="" width="480" height="600" loading="lazy" decoding="async">
                            </picture>
                            <span class="vr-card__top">
                                <span class="vr-card__length">{v["length"]}</span>
                                <span class="vr-card__soon">Coming soon</span>
                            </span>
                            <span class="vr-card__play">{PLAY}</span>
                            <span class="vr-card__body">
                                {QUOTE}
                                <span class="vr-card__text">&ldquo;{v["quote"]}&rdquo;</span>
                                <span class="vr-card__name">{v["name"]}</span>
                                <span class="vr-card__service">{v["service"]}</span>
                            </span>
                        </button>
                    </li>'''
    return f'''        <!-- ============ Page banner ============ -->
        <section class="page-banner" aria-labelledby="page-title">
            <div class="container page-banner__inner">
                <nav class="page-crumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="../index.html">Home</a></li>
                        <li aria-current="page">Reviews</li>
                    </ol>
                </nav>
                <h1 class="page-banner__title" id="page-title">Client Love</h1>
                <p class="page-banner__tag">Real stories from the women of Velaisance</p>
            </div>
{BANNER_WAVE}        </section>

{reviews_section}
        <!-- ============ Video stories (play in a popup; see VIDEOS in tools/build-pages.py) ============ -->
        <section class="vr" aria-labelledby="vr-title">
            <span class="vr__pattern" aria-hidden="true"></span>
            <span class="particles particles--light" aria-hidden="true"></span>
            <div class="container">
                <div class="vr__header">
                    <p class="badge"><span class="badge__dot" aria-hidden="true"></span>Video Stories</p>
                    <h2 class="section-title" id="vr-title">Hear It From <em>Our Clients</em></h2>
                    <p class="section-intro">Press play to hear how Velaisance made them feel, in their own words.</p>
                </div>
                <ul class="vr__grid">{cards}
                </ul>
            </div>
        </section>

        <!-- Video popup (reviews.js fills in the source on open, so videos only load when played) -->
        <dialog class="vr-modal" id="vr-modal" aria-labelledby="vr-modal-title">
            <div class="vr-modal__inner">
                <div class="vr-modal__head">
                    <p class="vr-modal__title" id="vr-modal-title"></p>
                    <button class="vr-modal__close" type="button" aria-label="Close video">
                        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6 6 18"/></svg>
                    </button>
                </div>
                <video class="vr-modal__video" controls playsinline preload="none"></video>
            </div>
        </dialog>
'''


# ---------------------------------------------------------------------------
# Shop page (The Elixir Vanity). Every "Shop Now" goes to that product's
# Prospyr page. PLACEHOLDER: product names, prices, links and art. For each
# product set "url" to its Prospyr product link and "img" to its photo base
# name in images/shop/ (a .webp + .jpg pair), then rebuild.
# ---------------------------------------------------------------------------
STORE = "https://velaisance-vanity.store.prospyrmed.com/"
SHOP = [
    ("skincare", "Skincare", "Professional-grade formulas chosen by Dr. Coleman to extend your results at home.", [
        ("Gentle Renewal Cleanser", "$38"), ("Hydrating Glow Serum", "$64"), ("Vitamin C Brightening Serum", "$72"),
        ("Barrier Repair Moisturizer", "$58"), ("Daily Mineral SPF 40", "$46"), ("Overnight Recovery Cream", "$68"),
        ("Soothing Eye Cream", "$52"), ("Exfoliating Enzyme Mask", "$48")]),
    ("candles", "Candles", "Hand-poured scents that bring the calm of the Velaisance suite into your home.", [
        ("Sacred Self-Care Candle", "$42"), ("Emerald Garden Candle", "$42"), ("Rose Gold Hour Candle", "$42"),
        ("Velvet Oud Candle", "$42"), ("Gleaux Citrus Candle", "$42")]),
    ("lip-gloss", "Lip Gloss", "Nourishing, high-shine glosses for an effortless finishing glow.", [
        ("Gleaux Gloss: Champagne", "$24"), ("Gleaux Gloss: Rose", "$24"), ("Gleaux Gloss: Nude Silk", "$24"),
        ("Gleaux Gloss: Berry", "$24"), ("Gleaux Gloss: Clear Crystal", "$24")]),
    ("sprays", "Room &amp; Linen Sprays", "A finishing mist for pillows, linens, and every room that deserves a reset.", [
        ("Lavender Rest Room &amp; Linen Spray", "$28"), ("White Orchid Room &amp; Linen Spray", "$28")]),
    ("accessories", "Self-Care Accessories", "Soft, spa-quality essentials for your at-home ritual.", [
        ("Spa Headband &amp; Wristband Set", "$32"), ("Silk Sleep Eye Mask", "$26")]),
]
ARROW = '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path d="M7 17 17 7M9 7h8v8"/></svg>'


def shop_body():
    tabs = '\n                    <li><button class="shop-tab is-active" type="button" data-filter="all" aria-pressed="true">All <span>{}</span></button></li>'.format(sum(len(c[3]) for c in SHOP))
    sections = ""
    for slug, name, intro, items in SHOP:
        tabs += f'\n                    <li><button class="shop-tab" type="button" data-filter="{slug}" aria-pressed="false">{name} <span>{len(items)}</span></button></li>'
        cards = ""
        for title, price in items:
            cards += f'''
                        <li class="product">
                            <a class="product__link" href="{STORE}" target="_blank" rel="noopener">
                                <span class="product__media">
                                    <img src="../images/shop/placeholder-{slug}.svg" alt="" width="400" height="400" loading="lazy" decoding="async">
                                    <span class="product__cta">Shop Now {ARROW}</span>
                                </span>
                                <span class="product__cat">{name}</span>
                                <span class="product__name">{title}</span>
                                <span class="product__price">{price}</span>
                            </a>
                        </li>'''
        sections += f'''
            <section class="shop-cat" id="{slug}" data-category="{slug}" aria-labelledby="{slug}-title">
                <div class="container">
                    <div class="shop-cat__head">
                        <div>
                            <h2 class="shop-cat__title" id="{slug}-title">{name}</h2>
                            <p class="shop-cat__intro">{intro}</p>
                        </div>
                        <span class="shop-cat__count">{len(items)} {"product" if len(items) == 1 else "products"}</span>
                    </div>
                    <ul class="products">{cards}
                    </ul>
                </div>
            </section>'''
    return f'''        <!-- ============ Page banner ============ -->
        <section class="page-banner page-banner--photo" aria-labelledby="page-title">
            <picture class="page-banner__bg" aria-hidden="true">
                <source media="(max-width: 767px)" srcset="../images/shop/shop-banner-m.webp" type="image/webp">
                <source media="(max-width: 767px)" srcset="../images/shop/shop-banner-m.jpg" type="image/jpeg">
                <source srcset="../images/shop/shop-banner.webp" type="image/webp">
                <img src="../images/shop/shop-banner.jpg" alt="" width="1122" height="401" fetchpriority="high">
            </picture>
            <div class="container page-banner__inner">
                <nav class="page-crumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="../index.html">Home</a></li>
                        <li aria-current="page">Shop</li>
                    </ol>
                </nav>
                <h1 class="page-banner__title" id="page-title">The Elixir Vanity</h1>
                <p class="page-banner__tag">Curated essentials to extend your glow at home</p>
                <a class="button button--primary page-banner__cta" href="#shop-products">Start Shopping</a>
            </div>
{BANNER_WAVE}        </section>

        <!-- ============ Shop perks ============ -->
        <section class="shop-perks" aria-label="Why shop with us">
            <ul class="container shop-perks__list">
                <li><span class="shop-perks__icon">{icon("shield", 24)}</span><span><strong>Chosen by Dr. Coleman</strong>Professional-grade picks</span></li>
                <li><span class="shop-perks__icon">{icon("heart", 24)}</span><span><strong>Gentle &amp; Clean</strong>Kind to every skin type</span></li>
                <li><span class="shop-perks__icon">{icon("home", 24)}</span><span><strong>Local Pickup</strong>Collect at the Walnut Creek studio</span></li>
                <li><span class="shop-perks__icon">{icon("glow", 24)}</span><span><strong>Gift Ready</strong>Beautifully packaged</span></li>
            </ul>
        </section>

        <!-- ============ Category filter (shop.js) + products grouped by category ============ -->
        <div class="shop">
            <span class="particles particles--gold" aria-hidden="true"></span>
            <nav class="shop-tabs" id="shop-products" aria-label="Filter products by category">
                <div class="container">
                    <p class="shop-tabs__label">Shop by Category</p>
                    <ul class="shop-tabs__list">{tabs}
                    </ul>
                </div>
            </nav>
{sections}
        </div>
'''


def page_head(head, title, desc, url_path, extra=""):
    h = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1)
    h = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*', lambda m: m.group(1) + desc, h)
    short = title.split(" | ")[0] + " | Velaisance"
    h = re.sub(r'(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*', lambda m: m.group(1) + short, h)
    h = re.sub(r'(<meta property="og:url" content="[^"]*/)[^"]*"', lambda m: m.group(1) + url_path + '"', h)
    return h + extra


def build():
    home = (ROOT / "index.html").read_text()
    head = home[:home.index("</head>")]
    chrome_top = home[home.index("    <!-- ============ Top Bar"):home.index('    <main id="main">')]
    cta = home[home.index("        <!-- ============ Final CTA"):home.index("        <!-- ============ Contact")]
    tail = home[home.index("    <!-- ============ Footer"):]

    # Head: this page's stylesheet and scripts, no homepage preloads
    head = re.sub(r'\s*<link rel="preload" as="image"[^>]*>', "", head)
    head = head.replace('<link rel="stylesheet" href="css/styles.css">', '<link rel="stylesheet" href="css/service-details.css">')
    head = head.replace('    <script src="javascript/script.js" defer></script>\n', '    <script src="javascript/service-details.js" defer></script>\n')
    head = up(head)

    for s in SERVICES:
        h = head
        h = re.sub(r"<title>.*?</title>", f"<title>{s['name']} | Velaisance Aesthetics &amp; Wellness | Walnut Creek</title>", h, count=1)
        desc = s["intro"][0].split(". ")[0] + "."
        h = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*', lambda m: m.group(1) + desc, h)
        h = re.sub(r'(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*', lambda m: m.group(1) + f"{s['name']} | Velaisance", h)
        h = re.sub(r'(<meta property="og:url" content="[^"]*/)[^"]*"', lambda m: m.group(1) + f'html/service-{s["slug"]}.html"', h)
        h += f'    <link rel="preload" as="image" href="../images/services/details/{s["slug"]}-main-m.webp" media="(max-width: 767px)" fetchpriority="high">\n'
        h += f'    <link rel="preload" as="image" href="../images/services/details/{s["slug"]}-main.webp" media="(min-width: 768px)" fetchpriority="high">\n'

        top = up(chrome_top)
        # Services stays highlighted in the menu on these pages
        top = top.replace('class="site-nav__link is-current" href="../index.html#hero" data-section="hero" aria-current="true"', 'class="site-nav__link" href="../index.html#hero" data-section="hero"')
        top = top.replace('class="site-nav__link site-nav__toggle"', 'class="site-nav__link site-nav__toggle is-current"', 1)

        out = (h + "</head>\n<body>\n    <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + top +
               '    <main id="main">\n' + page_body(s) + "\n" + up(cta) + "    </main>\n\n" + up(tail))
        (ROOT / "html" / f"service-{s['slug']}.html").write_text(out)
        print("built", f"html/service-{s['slug']}.html")

    # About page: its own stylesheet; Meet the Nurse Alchemist highlighted
    h = re.sub(r'<link rel="stylesheet" href="\.\./css/service-details\.css">', '<link rel="stylesheet" href="../css/about.css">', head)
    h = h.replace('    <script src="../javascript/service-details.js" defer></script>\n', "")
    h = page_head(h, "About Dr. Synedra Coleman | Velaisance Aesthetics &amp; Wellness",
                  "Meet Dr. Synedra Coleman, DNP, FNP, the nurse practitioner behind Velaisance Aesthetics &amp; Wellness in Walnut Creek.",
                  "html/about.html")
    top = up(chrome_top)
    top = top.replace('class="site-nav__link is-current" href="../index.html#hero" data-section="hero" aria-current="true"', 'class="site-nav__link" href="../index.html#hero" data-section="hero"')
    top = top.replace('class="site-nav__link" href="about.html" data-section="about"', 'class="site-nav__link is-current" href="about.html" data-section="about" aria-current="page"', 1)
    out = (h + "</head>\n<body>\n    <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + top +
           '    <main id="main">\n' + about_body() + "\n" + up(cta) + "    </main>\n\n" + up(tail))
    (ROOT / "html" / "about.html").write_text(out)
    print("built html/about.html")

    # Contact page: banner, the homepage contact section, footer
    contact = home[home.index("        <!-- ============ Contact"):home.index("    </main>")]
    h = re.sub(r'<link rel="stylesheet" href="\.\./css/service-details\.css">\n?\s*', "", head)
    h = h.replace('    <script src="../javascript/service-details.js" defer></script>\n', "")
    h = page_head(h, "Contact Velaisance | Aesthetics &amp; Wellness in Walnut Creek",
                  "Contact Velaisance Aesthetics &amp; Wellness in Walnut Creek. Call 628-252-8115 or send a message to book your consultation.",
                  "html/contact.html")
    top = up(chrome_top)
    top = top.replace('class="site-nav__link is-current" href="../index.html#hero" data-section="hero" aria-current="true"', 'class="site-nav__link" href="../index.html#hero" data-section="hero"')
    top = top.replace('class="site-nav__link" href="contact.html" data-section="contact"', 'class="site-nav__link is-current" href="contact.html" data-section="contact" aria-current="page"', 1)
    banner = f'''        <!-- ============ Page banner ============ -->
        <section class="page-banner" aria-labelledby="page-title">
            <div class="container page-banner__inner">
                <nav class="page-crumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="../index.html">Home</a></li>
                        <li aria-current="page">Contact</li>
                    </ol>
                </nav>
                <h1 class="page-banner__title" id="page-title">Get in Touch</h1>
                <p class="page-banner__tag">We&rsquo;d love to hear from you</p>
            </div>
{BANNER_WAVE}        </section>

'''
    out = (h + "</head>\n<body>\n    <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + top +
           '    <main id="main">\n' + banner + up(contact) + "    </main>\n\n" + up(tail))
    (ROOT / "html" / "contact.html").write_text(out)
    print("built html/contact.html")

    # Reviews page: banner, the homepage reviews carousel, video stories, CTA
    reviews = home[home.index("        <!-- ============ Reviews"):home.index("        <!-- ============ Final CTA")]
    h = re.sub(r'<link rel="stylesheet" href="\.\./css/service-details\.css">', '<link rel="stylesheet" href="../css/reviews.css">', head)
    h = h.replace('<script src="../javascript/service-details.js" defer></script>', '<script src="../javascript/reviews.js" defer></script>')
    h = page_head(h, "Client Reviews | Velaisance Aesthetics &amp; Wellness",
                  "Read and watch real client reviews of Velaisance Aesthetics &amp; Wellness, Dr. Synedra Coleman's nurse practitioner-led med spa in Walnut Creek.",
                  "html/reviews.html")
    top = up(chrome_top)
    top = top.replace('class="site-nav__link is-current" href="../index.html#hero" data-section="hero" aria-current="true"', 'class="site-nav__link" href="../index.html#hero" data-section="hero"')
    top = top.replace('class="site-nav__link" href="reviews.html" data-section="reviews"', 'class="site-nav__link is-current" href="reviews.html" data-section="reviews" aria-current="page"', 1)
    out = (h + "</head>\n<body>\n    <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + top +
           '    <main id="main">\n' + reviews_body(up(reviews)) + "\n" + up(cta) + "    </main>\n\n" + up(tail))
    (ROOT / "html" / "reviews.html").write_text(out)
    print("built html/reviews.html")

    # Shop page
    h = re.sub(r'<link rel="stylesheet" href="\.\./css/service-details\.css">', '<link rel="stylesheet" href="../css/shop.css">', head)
    h = h.replace('<script src="../javascript/service-details.js" defer></script>', '<script src="../javascript/shop.js" defer></script>')
    h = page_head(h, "Shop The Elixir Vanity | Velaisance Aesthetics &amp; Wellness",
                  "Shop skincare, candles, lip gloss, room and linen sprays, and self-care accessories curated by Dr. Synedra Coleman.",
                  "html/shop.html")
    top = up(chrome_top).replace('class="site-nav__link is-current" href="../index.html#hero" data-section="hero" aria-current="true"', 'class="site-nav__link" href="../index.html#hero" data-section="hero"')
    out = (h + "</head>\n<body>\n    <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n\n" + top +
           '    <main id="main">\n' + shop_body() + "\n" + up(cta) + "    </main>\n\n" + up(tail))
    (ROOT / "html" / "shop.html").write_text(out)
    print("built html/shop.html")


if __name__ == "__main__":
    build()

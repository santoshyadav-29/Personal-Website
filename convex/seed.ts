import { mutation } from "./_generated/server";
import { requireAdmin, getViewer, isAdminUser } from "./lib/admin";

const INTRODUCTION = {
  headline: "Hey there! Santosh here 👋🏻",
  paragraphs: [
    "A passionate Computer Engineer dedicated to delivering exceptional digital experiences, creating scalable, secure & performant solutions, exploring emerging technologies and continuously striving on delivering excellence",
    "Always evolving, learning and improving – one day at a time.",
  ],
};

const EDUCATION = {
  label: "Studying at",
  items: [
    {
      name: "Kathmandu University",
      url: "https://ku.edu.np/",
      description: "Currently studying Computer Science and Engineering",
    },
  ],
};

const PROJECTS = {
  label: "Recent Project",
  items: [
    {
      name: "Crowdfunding",
      description: " A Blockchain based open source crowdfunding platform.",
      source: "github.com/santoshyadav-29",
    },
    {
      name: "Shoping Cart",
      description: " A shopping Cart made using typescript and bootstrap",
      source: "github.com/santoshyadav-29",
    },
    {
      name: "LinkedUs",
      description: " A Job Portal made using MERN stack",
      source: "github.com/santoshyadav-29",
    },
  ],
};

const ABOUT = {
  title: "More about me",
  paragraphs: [
    "Apart from my work, I'm all about sharing knowledge, fostering growth, and building strong developer communities – specially through mentoring.",
    "If you're interested in my work and/or skillsets, you can always get in touch at ymanoutube@gmail.com",
  ],
  email: "ymanoutube@gmail.com",
};

const FAQ = {
  title: "FAQ",
  items: [
    {
      question: "Who are you?",
      answer:
        "I'm Santosh Yadav — a Computer Engineer focused on building scalable, secure, and thoughtful digital products.",
    },
    {
      question: "How can I reach you?",
      answer: "Email me at ymanoutube@gmail.com.",
    },
  ],
};

const LINKS = {
  items: [
    { label: "Email", url: "mailto:ymanoutube@gmail.com" },
    { label: "GitHub", url: "https://github.com/santoshyadav-29" },
  ],
};

const POSTS = [
  {
    slug: "design-thinking",
    title: "A Deep Dive into Design Thinking",
    description:
      "Design thinking is a non-linear, iterative process that teams use to understand users, challenge assumptions, redefine problems and create innovative solutions to prototype and test. It is most useful to tackle ill-defined or unknown problems and involves five phases: Empathize, Define, Ideate, Prototype and Test.",
    pubDate: Date.parse("2024-04-01T18:15:00.000Z"),
    heroImagePath: "/Blog Images/IN_DEsignthinking_Design-Thinking-2.png",
    body: `Innovation is not a solitary pursuit; it's a collaborative endeavor that thrives on the synergy of diverse perspectives and creative problem-solving methodologies. One such methodology that has been gaining momentum across various industries is design thinking. Rooted in empathy, creativity, and a human-centric approach, design thinking offers a structured framework for tackling complex problems and generating innovative solutions.

At its core, design thinking is not just about aesthetics or visual appeal; it's a mindset, a way of approaching challenges with an open mind and a willingness to iterate and refine until the best solution emerges. It's about understanding the needs, desires, and pain points of end-users and designing solutions that truly resonate with them.

The beauty of design thinking lies in its iterative nature, which is often structured around several key stages:

1. Empathize: The foundation of design thinking begins with empathy. This stage involves putting yourself in the shoes of the end-user, understanding their perspectives, emotions, and challenges. By immersing ourselves in the user's experience, we gain valuable insights that inform the design process.
2. Define: Once we've gained a deep understanding of the user's needs and pain points, the next step is to define the problem statement. This involves distilling the insights gathered during the empathy stage into a clear and concise problem statement that guides the design process.
3. Ideate: With a well-defined problem statement in hand, the ideation stage encourages divergent thinking and brainstorming of potential solutions. This is a time for creativity to flourish, where no idea is too outlandish or impractical. By generating a wide range of ideas, we increase the likelihood of discovering innovative solutions.
4. Prototype: After ideation comes prototyping, where we bring our ideas to life in a tangible form. Prototypes can range from simple sketches and wireframes to more sophisticated mock-ups or prototypes. The goal is to quickly iterate and test different concepts to gather feedback and refine the solution further.
5. Test: The final stage of the design thinking process involves testing the prototypes with real users to gather feedback and insights. This feedback loop is crucial for validating assumptions, identifying areas for improvement, and refining the solution iteratively.

While the design thinking process may seem linear, in practice, it's often a non-linear and iterative journey, with each stage informing and influencing the others. It's a dynamic process that encourages flexibility, adaptability, and a willingness to embrace failure as a natural part of the creative process.

Design thinking is not just reserved for designers or creative professionals; it's a mindset that can be applied to a wide range of disciplines and industries. Whether you're designing a new product, improving an existing service, or solving complex business challenges, design thinking offers a valuable framework for driving innovation and delivering meaningful solutions.

By fostering empathy, encouraging creativity, and promoting collaboration, design thinking empowers teams to tackle problems from a human-centric perspective, ultimately leading to more impactful and sustainable solutions. As we continue to navigate an increasingly complex and interconnected world, the principles of design thinking have never been more relevant or essential. So let's embrace this powerful approach to problem-solving and unleash our creative potential to shape a better future for all.`,
  },
  {
    slug: "sustainable-programming",
    title: "Sustainable Programming",
    description:
      "sustainable programming code refers to the creation of computer programs that consider the environmental impact of their design and operation to reduce their carbon footprint.",
    pubDate: Date.parse("2023-12-12T18:15:00.000Z"),
    heroImagePath: "/Sustainable programming.jpg",
    body: `Hey there! Have you ever thought about how our tech stuff, like websites and software, might affect the environment? I didn't until I started looking for a project idea for a Hackfest whose problem statement was sustainable future.

I was surprised to find out that even the smallest things we do online, like putting up a website or writing code, can actually hurt the Earth. The more I learned, the more I realized that all the internet stuff we enjoy uses a lot of energy, and it's not actually that great. I am writing this blog to make people aware of how technology affects the environment and ways to deal with them.

### What is Sustainable Programming?

In a general sense, sustainable programming code refers to the creation of computer programs that consider the environmental impact of their design and operation to reduce their carbon footprint and contribute to the preservation of the environment. Sustainable programming code is written with energy efficiency in mind. This means that the software is designed to use as few resources and energy as possible. For example, the binary search algorithm is more efficient than the linear search algorithm since it uses fewer operations to find a result. Even when we are just practicing good quality code that uses the bare minimum lines of syntax and use modularity, we are actually contributing towards a sustainable future. And well that turns out to be opposite when we are not. By writing optimized code, it is possible to reduce processing time and decrease energy consumption in information processing. One technique for optimizing code is to reduce the file size by removing white space and comments. It is important to avoid using infinite or redundant loops that consume unnecessary resources. Libraries and frameworks can also be used to avoid having to reinvent the wheel. In this way, the creation of duplicate code is avoided, and the consumption of resources is reduced.

Optimizing resources also involves the use of renewable energy in development and on servers. In addition to optimizing the code, it's also important to consider the environmental impact of the servers used to host and run the applications. One way to reduce the environmental impact of servers is to use renewable energy, such as solar panels or wind power. You can also use a hosting provider that uses energy-efficient servers or offsets its carbon footprint through environmental initiatives. The use of open-source software can be beneficial for environmentally sustainable programming. Open-source software is developed and maintained by the community and therefore does not require the same number of resources as proprietary software. Furthermore, open-source software can be customized and enhanced to meet the specific needs of the user. Green Software Design (ESD): This design technique focuses on creating software that uses fewer resources and energy. This includes techniques such as virtualization and the use of distributed systems, which can reduce the amount of hardware and power required to run the software.

### Conclusion

It can be concluded that sustainable programming is an increasingly important practice in the era of sustainability and environmental protection.

By optimizing the code, optimizing resources, modular design, social responsibility, maintainability in software development, using energy-efficient algorithms, reducing the use of resources, and using renewable energy, the environmental impact of the company can be reduced. technology and encourage more sustainable programming. Also, use practices and techniques such as agile development and ecological software design.

For all the above, we can say that it is the responsibility of developers to create software that considers its environmental impact, reduces its carbon footprint, and contributes to the preservation of the environment.

All these measures can help achieve this goal.`,
  },
  {
    slug: "the-tale-of-sun-and-the-moon",
    title: "Sunset",
    description: "This is the blog which was meant to be about  sunset but lets see.",
    pubDate: Date.parse("2023-11-19T18:15:00.000Z"),
    heroImagePath: "/IMG_20200315_184742_0.jpg",
    body: "**Will Write Today**",
  },
];

async function upsertSection(
  ctx: { db: any },
  key: string,
  title: string,
  data: unknown,
) {
  const existing = await ctx.db
    .query("siteSections")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
  const now = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, { title, data, updatedAt: now });
  } else {
    await ctx.db.insert("siteSections", { key, title, data, updatedAt: now });
  }
}

/**
 * Seed site sections + published posts from the previous hardcoded/markdown content.
 * Safe to re-run: upserts sections; inserts posts only when slug is missing.
 * Callable by admin, or by ADMIN_EMAIL user during first bootstrap.
 */
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const viewer = await getViewer(ctx);
    const allowed =
      (viewer && isAdminUser(viewer.user)) ||
      (viewer && adminEmail && viewer.user.email?.toLowerCase() === adminEmail);

    if (!allowed) {
      // Allow unauthenticated seed only when database has zero posts AND zero sections
      // (fresh local/dev bootstrap). Production should set ADMIN_EMAIL and sign in.
      const anyPost = await ctx.db.query("posts").take(1);
      const anySection = await ctx.db.query("siteSections").take(1);
      if (anyPost.length > 0 || anySection.length > 0) {
        throw new Error("Forbidden — sign in as admin to re-seed");
      }
    }

    await upsertSection(ctx, "introduction", "Introduction", INTRODUCTION);
    await upsertSection(ctx, "education", "Education", EDUCATION);
    await upsertSection(ctx, "projects", "Projects", PROJECTS);
    await upsertSection(ctx, "about", "About", ABOUT);
    await upsertSection(ctx, "faq", "FAQ", FAQ);
    await upsertSection(ctx, "links", "Links", LINKS);

    let inserted = 0;
    for (const post of POSTS) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q: any) => q.eq("slug", post.slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("posts", {
        slug: post.slug,
        title: post.title,
        description: post.description,
        body: post.body,
        heroImagePath: post.heroImagePath,
        published: true,
        pubDate: post.pubDate,
        updatedAt: Date.now(),
      });
      inserted += 1;
    }

    if (viewer && adminEmail && viewer.user.email?.toLowerCase() === adminEmail) {
      await ctx.db.patch(viewer.userId, { role: "admin" });
    }

    return { insertedPosts: inserted, sections: 6 };
  },
});

/** Force-refresh sections from defaults (admin only). Does not delete posts. */
export const resetSections = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await upsertSection(ctx, "introduction", "Introduction", INTRODUCTION);
    await upsertSection(ctx, "education", "Education", EDUCATION);
    await upsertSection(ctx, "projects", "Projects", PROJECTS);
    await upsertSection(ctx, "about", "About", ABOUT);
    await upsertSection(ctx, "faq", "FAQ", FAQ);
    await upsertSection(ctx, "links", "Links", LINKS);
    return { ok: true as const };
  },
});

export default function About() {
  return (
    <section className="section aboutPage">
      <div className="aboutHero glass">
        <div className="aboutHero__copy">
          <span className="aboutHero__eyebrow">Smart Meal Planner</span>
          <h3 className="aboutHero__title">
            Healthy meals that fit your budget, schedule, and lifestyle.
          </h3>
          <p className="aboutHero__text">
            Smart Meal Planner helps users create practical meal plans with
            Filipino-friendly budgets, estimated prices, cooking time, and
            personalized food preferences. It is built for students, busy
            families, fitness goals, and anyone who wants healthier choices
            without overspending.
          </p>
          <div className="aboutHero__badges">
            <span>Budget-aware</span>
            <span>Personalized</span>
            <span>Easy to save</span>
          </div>
        </div>

        <div className="aboutHero__panel">
          <span className="material-symbols-outlined aboutHero__icon">
            restaurant_menu
          </span>
          <strong>Plan smarter. Eat better. Spend wiser.</strong>
          <p>
            Generate meals, review ingredients, compare estimates, and save your
            best plans in one clean dashboard.
          </p>
        </div>
      </div>

      <div className="aboutGrid">
        <article className="aboutCard glass">
          <span className="material-symbols-outlined aboutCard__icon">savings</span>
          <h4>Budget-first recommendations</h4>
          <p>
            Enter your budget and number of people, then get meal ideas designed
            to stay realistic for everyday grocery planning.
          </p>
        </article>

        <article className="aboutCard glass">
          <span className="material-symbols-outlined aboutCard__icon">
            tune
          </span>
          <h4>Flexible food filters</h4>
          <p>
            Choose meal type, protein source, carb source, restrictions, and
            cooking method so the plan matches what you actually need.
          </p>
        </article>

        <article className="aboutCard glass">
          <span className="material-symbols-outlined aboutCard__icon">
            bookmark
          </span>
          <h4>History and saved meals</h4>
          <p>
            Generated plans are stored in your history, while your favorite
            recipes can be saved for quick access anytime.
          </p>
        </article>
      </div>
    </section>
  );
}


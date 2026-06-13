const stats = [
  { value: "1B+", label: "Plastic bottles used for cleaning products in Pakistan every year" },
  { value: "90%", label: "Less plastic per refill compared to a new bottle" },
  { value: "1", label: "Bottle to last you years, not weeks" },
]

export function Mission() {
  return (
    <section id="mission" className="bg-primary text-primary-foreground">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Why refills matter
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Every cleaning bottle is mostly water — and mostly plastic. We
            ship the cleaning power, not the water, so less plastic ends up
            in Pakistan's landfills and waterways.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-semibold md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-primary-foreground/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

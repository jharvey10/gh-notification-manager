import PropTypes from 'prop-types'

export function SettingsSection({ title, description, children, actions = undefined }) {
  return (
    <section className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-base-content/70">{description}</p>
      </div>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </section>
  )
}

SettingsSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node
}

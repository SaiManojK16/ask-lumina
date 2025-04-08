import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

export default function ProductDetail({ product, onBack, onEdit, onDelete }) {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] backdrop-blur-sm">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-accent-light dark:text-accent-dark hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 rounded-lg transition-colors"
        >
          <FaArrowLeft size={14} />
          <span>Back to Products</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-light/10 dark:bg-accent-dark/10 text-accent-light dark:text-accent-dark rounded-lg hover:bg-accent-light/20 dark:hover:bg-accent-dark/20 transition-colors"
          >
            <FaEdit size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 dark:bg-red-400/10 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-500/20 dark:hover:bg-red-400/20 transition-colors"
          >
            <FaTrash size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
      <div className="p-6">

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {product.name}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
            </div>

            {product.features?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Features
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{feature.title}</h4>
                        <p className="text-sm">{feature.details}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.why_choose_this?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Why Choose This
                </h3>
                <ul className="space-y-2">
                  {product.why_choose_this.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-accent-light/[0.07] to-transparent dark:from-accent-dark/[0.07] dark:to-transparent rounded-xl p-6 ring-1 ring-gray-900/[0.05] dark:ring-white/[0.05] backdrop-blur-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Technical Specifications
              </h3>
              <dl className="space-y-4">
                {product.product_specs?.length > 0 && (
                  <ul className="space-y-2">
                    {product.product_specs.map((spec, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light dark:bg-accent-dark flex-shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Gain
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.gain}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Material
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.material}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Surface
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.surface}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Projection Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {product.projection_type}
                  </dd>
                </div>
              </dl>
            </div>

            {product.technical_datasheet && (
              <a
                href={product.technical_datasheet}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-accent-light dark:bg-accent-dark text-white rounded-lg hover:bg-accent-light/90 dark:hover:bg-accent-dark/90 shadow-sm hover:shadow transition-all duration-300"
              >
                Download Technical Datasheet
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';

export default function ProductDetail({ product, onBack, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FaArrowLeft size={16} />
            <span>Back to Products</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 rounded-md hover:bg-accent-light/10 dark:hover:bg-accent-dark/10 text-accent-light/70 dark:text-accent-dark/70 hover:text-accent-light dark:hover:text-accent-dark transition-colors"
              title="Edit Product"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 rounded-md hover:bg-red-500/10 dark:hover:bg-red-400/10 text-red-500/70 dark:text-red-400/70 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Delete Product"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>

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
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light/50 dark:bg-accent-dark/50 flex-shrink-0" />
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
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light/50 dark:bg-accent-dark/50 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Technical Specifications
              </h3>
              <dl className="space-y-4">
                {product.product_specs?.length > 0 && (
                  <ul className="space-y-2">
                    {product.product_specs.map((spec, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-light/50 dark:bg-accent-dark/50 flex-shrink-0" />
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
                className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
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

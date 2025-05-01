import { AllServices, ServiceProvidedData } from '../shared/dataClasses'
import { Service } from '../entities/service'

/**
 * Create new service 'categories'
 */
export class CreateServiceCategoryController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async createServiceCategory(categoryLabel: string): Promise<void> {
        return await this.service.createServiceCategory(categoryLabel)
    }
}


/**
 * View all service 'categories' that exist
 */
export class ViewServiceCategoriesController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async viewServiceCategories(): Promise<string[]> {
        return await this.service.viewServiceCategories()
    }
}

/**
 * Update service 'categories'
 */
export class UpdateServiceCategoryController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async updateServiceCategory(category: string, newCategory: string): Promise<void> {
        await this.service.updateServiceCategory(category, newCategory)
    }
}

/**
 * Delete service 'categories'
 */
export class DeleteServiceCategoryController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async deleteServiceCategory(category: string): Promise<void> {
        await this.service.deleteServiceCategory(category)
    }
}
/**
 * Search for service 'categories'
 */
export class SearchServiceCategoryController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async searchServiceCategory(category: string): Promise<string> {
        return await this.service.searchServiceCategory(category)
    }
}
/**
 * Gets all the service 'types' provided by a cleaner (by their userID)
 */
export class ViewServicesProvidedController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async viewServicesProvided(
        userID: number,
        serviceName: string | null
    ): Promise<ServiceProvidedData[]> {
        return await this.service.viewServicesProvided(userID, serviceName)
    }
}

/**
 * Gets all the service 'types' provided by a cleaner (by their userID)
 */
export class ViewAllServicesProvidedController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async viewAllServicesProvided(
    ): Promise<AllServices[]> {
        return await this.service.viewAllServicesProvided()
    }
}



/**
 * Cleaners can add the types of services they provide
 */
export class CreateServiceProvidedController {
    private service: Service

    constructor() {
        this.service = new Service()
    }

    public async createServiceProvided(
        cleanerID: number,
        serviceName: string,
        serviceCategory: string,
        description: string,
        price: number
    ): Promise<void> {
        await this.service.createServiceProvided(
            cleanerID,
            serviceName,
            serviceCategory,
            description,
            price
        )
    }
}

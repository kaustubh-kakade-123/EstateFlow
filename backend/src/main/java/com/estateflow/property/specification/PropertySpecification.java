package com.estateflow.property.specification;

import org.springframework.data.jpa.domain.Specification;

import com.estateflow.property.dto.PropertySearchCriteria;
import com.estateflow.property.entity.Property;
import com.estateflow.property.entity.PropertyStatus;

public final class PropertySpecification {

	private PropertySpecification() {
	}

	public static Specification<Property> withFilters(PropertySearchCriteria criteria) {

		return (root, query, cb) -> {

			var predicate = cb.conjunction();

			// Public search must NEVER expose non-published listings.
			predicate = cb.and(predicate, cb.equal(root.get("status"), PropertyStatus.PUBLISHED),
					cb.isTrue(root.get("verified")));

			if (criteria.city() != null && !criteria.city().isBlank()) {
				predicate = cb.and(predicate,
						cb.equal(cb.lower(root.get("city")), criteria.city().trim().toLowerCase()));
			}

			if (criteria.locality() != null && !criteria.locality().isBlank()) {

				predicate = cb.and(predicate,
						cb.equal(cb.lower(root.get("locality")), criteria.locality().trim().toLowerCase()));
			}

			if (criteria.propertyType() != null) {
				predicate = cb.and(predicate, cb.equal(root.get("propertyType"), criteria.propertyType()));
			}

			if (criteria.listingType() != null) {
				predicate = cb.and(predicate, cb.equal(root.get("listingType"), criteria.listingType()));
			}

			if (criteria.minPrice() != null) {
				predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("price"), criteria.minPrice()));
			}

			if (criteria.maxPrice() != null) {
				predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("price"), criteria.maxPrice()));
			}

			if (criteria.bedrooms() != null) {
				predicate = cb.and(predicate, cb.equal(root.get("bedrooms"), criteria.bedrooms()));
			}

			return predicate;
		};
	}
}
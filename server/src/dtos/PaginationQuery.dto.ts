export interface PaginationQueryDto {
    order?: string;
    page?: number;
    per_page?: number;
    filter?: string;
    fields?: string;
    filter_operator?: string;
}

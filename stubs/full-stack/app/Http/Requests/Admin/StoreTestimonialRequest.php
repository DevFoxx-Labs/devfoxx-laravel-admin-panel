<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage testimonials');
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:100'],
            'designation' => ['nullable', 'string', 'max:100'],
            'company'     => ['nullable', 'string', 'max:100'],
            'avatar'      => ['nullable', 'url', 'max:500'],
            'rating'      => ['required', 'integer', 'min:1', 'max:5'],
            'content'     => ['required', 'string', 'min:10', 'max:2000'],
            'is_featured' => ['boolean'],
            'is_active'   => ['boolean'],
            'sort_order'  => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'The reviewer name is required.',
            'content.required' => 'The testimonial content is required.',
            'content.min'      => 'The content must be at least 10 characters.',
            'rating.min'       => 'Rating must be between 1 and 5.',
            'rating.max'       => 'Rating must be between 1 and 5.',
        ];
    }
}

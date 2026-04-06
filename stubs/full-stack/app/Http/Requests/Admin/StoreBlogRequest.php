<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage blogs');
    }

    public function rules(): array
    {
        $blogId = $this->route('blog')?->id;

        return [
            'title'            => ['required', 'string', 'max:255'],
            'slug'             => ['required', 'string', 'max:255', 'unique:blogs,slug,' . $blogId],
            'excerpt'          => ['nullable', 'string', 'max:500'],
            'content'          => ['required', 'string'],
            'status'           => ['required', 'in:draft,published,archived'],
            'featured_image'   => ['nullable', 'string', 'max:500'],
            'categories'       => ['required', 'array', 'min:1'],
            'categories.*'     => ['integer', 'exists:categories,id'],
            'meta_title'       => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords'    => ['nullable', 'string', 'max:255'],
            'published_at'     => ['nullable', 'date'],
        ];
    }
}
